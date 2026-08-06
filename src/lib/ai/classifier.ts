/**
 * AI Classifier — Multinomial Naive Bayes (dependency-free).
 *
 * The rule engine matches hand-coded keywords/patterns; this classifier
 * *learns* word/n-gram statistics from labeled examples, so it generalizes to
 * paraphrases and novel phrasings. Its top prediction + confidence are fused
 * into the detection pipeline as an "AI signal" when enabled.
 *
 * Training is deterministic and runs once at module load (~96 examples), so the
 * model is always ready with no serialized artifacts to manage.
 */
import { normalizeText } from "@/lib/detection/normalize";
import { TRAINING_DATA, type AIClass } from "./training-data";

const CLASSES: AIClass[] = [
  "gambling",
  "scam",
  "phishing",
  "spam",
  "toxic",
  "safe",
];

/** Tokenize normalized text into word unigrams + bigrams. */
function tokenize(text: string): string[] {
  const { normalized } = normalizeText(text);
  const words = normalized.split(/\s+/).filter((w) => w.length > 0);
  const tokens: string[] = [];
  for (const w of words) {
    if (w.length >= 2) tokens.push(w);
  }
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]}_${words[i + 1]}`);
  }
  return tokens;
}

interface TrainedModel {
  classPriors: Map<AIClass, number>; // log prior
  tokenLogLikelihood: Map<AIClass, Map<string, number>>; // log P(token | class)
  vocabSize: number;
  classTokenTotals: Map<AIClass, number>;
}

let _model: TrainedModel | null = null;

function train(): TrainedModel {
  const docsByClass = new Map<AIClass, string[]>();
  for (const c of CLASSES) docsByClass.set(c, []);
  for (const ex of TRAINING_DATA) {
    docsByClass.get(ex.label)!.push(ex.text);
  }

  const totalDocs = TRAINING_DATA.length;
  const classPriors = new Map<AIClass, number>();
  const tokenCountsByClass = new Map<AIClass, Map<string, number>>();
  const classTokenTotals = new Map<AIClass, number>();
  const vocab = new Set<string>();

  for (const c of CLASSES) {
    const docs = docsByClass.get(c)!;
    classPriors.set(c, Math.log(docs.length / totalDocs));
    const counts = new Map<string, number>();
    let total = 0;
    for (const doc of docs) {
      for (const tok of tokenize(doc)) {
        counts.set(tok, (counts.get(tok) ?? 0) + 1);
        vocab.add(tok);
        total++;
      }
    }
    tokenCountsByClass.set(c, counts);
    classTokenTotals.set(c, total);
  }

  const vocabSize = vocab.size;
  const tokenLogLikelihood = new Map<AIClass, Map<string, number>>();
  for (const c of CLASSES) {
    const counts = tokenCountsByClass.get(c)!;
    const total = classTokenTotals.get(c)!;
    const ll = new Map<string, number>();
    for (const [tok, count] of counts) {
      // Laplace (add-1) smoothing
      ll.set(tok, Math.log((count + 1) / (total + vocabSize)));
    }
    tokenLogLikelihood.set(c, ll);
  }

  return { classPriors, tokenLogLikelihood, vocabSize, classTokenTotals };
}

function getModel(): TrainedModel {
  if (!_model) _model = train();
  return _model;
}

export interface Classification {
  category: AIClass;
  /** Confidence 0..1 for the top class (softmax of log-scores). */
  confidence: number;
  /** Probability per class. */
  probabilities: Record<AIClass, number>;
  /** Raw log-scores per class. */
  scores: Record<AIClass, number>;
}

/** Classify a message into one of the threat/safe categories. */
export function classify(text: string): Classification {
  const model = getModel();
  const tokens = tokenize(text);
  const scores: Record<AIClass, number> = {} as any;

  for (const c of CLASSES) {
    let logProb = model.classPriors.get(c)!;
    const ll = model.tokenLogLikelihood.get(c)!;
    const total = model.classTokenTotals.get(c)!;
    const denom = total + model.vocabSize;
    for (const tok of tokens) {
      // P(token | class) with smoothing — handles unseen tokens too
      logProb += ll.get(tok) ?? Math.log(1 / denom);
    }
    scores[c] = logProb;
  }

  // Softmax over log-scores → probabilities (numerically stable)
  const max = Math.max(...CLASSES.map((c) => scores[c]));
  const exps = CLASSES.map((c) => Math.exp(scores[c] - max));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  const probabilities = {} as Record<AIClass, number>;
  CLASSES.forEach((c, i) => {
    probabilities[c] = exps[i] / sumExp;
  });

  // pick top
  let top: AIClass = "safe";
  let topProb = -1;
  for (const c of CLASSES) {
    if (probabilities[c] > topProb) {
      topProb = probabilities[c];
      top = c;
    }
  }

  return { category: top, confidence: topProb, probabilities, scores };
}

/** Retrain (useful after hot-editing training data in dev). */
export function retrain(): void {
  _model = train();
}

export { CLASSES as AI_CLASSES };
