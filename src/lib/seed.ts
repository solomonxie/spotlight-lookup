import { createCollection } from '../db/collections';
import { bulkInsertEntries } from '../db/entries';
import { SETTINGS_KEYS, getSetting, setSetting } from '../db/settings';

const STARTER_WORDS: [term: string, reading: string, definition: string, example: string][] = [
  ['serendipity', '/ˌserənˈdipədē/', 'n. 意外发现珍奇事物的本领；机缘巧合', 'Finding that café was pure serendipity.'],
  ['resilient', '/rɪˈzɪliənt/', 'adj. 有韧性的；能快速恢复的', 'A resilient system recovers without a restart.'],
  ['ephemeral', '/ɪˈfem(ə)rəl/', 'adj. 短暂的；转瞬即逝的', 'Ephemeral storage is wiped on every deploy.'],
  ['meticulous', '/məˈtikyələs/', 'adj. 一丝不苟的；极为细致的', 'She keeps meticulous notes.'],
  ['pragmatic', '/præɡˈmædɪk/', 'adj. 务实的；实用主义的', 'A pragmatic fix beats an elegant plan.'],
  ['ambiguous', '/æmˈbɪɡjuəs/', 'adj. 模棱两可的；含糊不清的', 'The spec is ambiguous about retries.'],
  ['tenacious', '/təˈneɪʃəs/', 'adj. 顽强的；坚持不懈的', 'Tenacious debugging paid off.'],
  ['nuance', '/ˈnuːɑːns/', 'n. 细微差别；微妙之处', 'The nuance is lost in translation.'],
  ['obsolete', '/ˌɑːbsəˈliːt/', 'adj. 过时的；废弃的', 'That API is obsolete.'],
  ['threshold', '/ˈθreʃhoʊld/', 'n. 门槛；临界值', 'Alerts fire above the threshold.'],
  ['redundant', '/rɪˈdʌndənt/', 'adj. 多余的；冗余的', 'Redundant replicas survive a node loss.'],
  ['coherent', '/koʊˈhɪrənt/', 'adj. 连贯的；有条理的', 'Write a coherent summary.'],
  ['intuitive', '/ɪnˈtuːɪtɪv/', 'adj. 直观的；凭直觉的', 'The gesture is intuitive.'],
  ['deliberate', '/dɪˈlɪbərət/', 'adj. 深思熟虑的；故意的', 'That was a deliberate trade-off.'],
  ['arbitrary', '/ˈɑːrbɪtreri/', 'adj. 任意的；武断的', 'The limit is arbitrary but documented.'],
];

const STARTER_CARDS: [front: string, back: string, tags: string][] = [
  ['idempotent', 'Running it twice changes nothing more than running it once.', 'engineering'],
  ['backpressure', 'A consumer signalling a producer to slow down.', 'engineering'],
  ['bikeshedding', 'Spending debate on trivia while the hard part goes unreviewed.', 'engineering'],
];

/** Gives a fresh install something to find in Spotlight before any import happens. */
export async function seedIfEmpty(): Promise<boolean> {
  if (await getSetting(SETTINGS_KEYS.seeded)) return false;

  const dictionary = await createCollection({
    name: 'English → 中文 (starter)',
    kind: 'dictionary',
    language: 'en',
    targetLanguage: 'zh-Hans',
  });
  await bulkInsertEntries(
    dictionary.id,
    STARTER_WORDS.map(([term, reading, definition, example]) => ({
      term,
      reading,
      definition,
      example,
      tags: 'starter',
    }))
  );

  const deck = await createCollection({
    name: 'My Flashcards',
    kind: 'flashcards',
    language: 'en',
  });
  await bulkInsertEntries(
    deck.id,
    STARTER_CARDS.map(([term, definition, tags]) => ({ term, definition, tags }))
  );

  await setSetting(SETTINGS_KEYS.seeded, new Date().toISOString());
  return true;
}
