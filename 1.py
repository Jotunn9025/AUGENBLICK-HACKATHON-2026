from abctokz import Tokenizer
from abctokz.config.defaults import bpe_multilingual

from abctokz.config.schemas import SequenceNormalizerConfig

# 1. Configure the pipeline
config = bpe_multilingual(vocab_size=8000)

# 2. Train on your corpus
tokenizer = Tokenizer.from_config(config)

tokenizer.train(["data/corpus.txt"], config)
tokenizer.save("artifacts/bpe_tok")

# 3. Reload and use
tok = Tokenizer.load("artifacts/bpe_tok")
enc = tok.encode("नमस्ते world")

print(enc.tokens)          # subword pieces
print(enc.ids)             # vocabulary IDs
print(tok.decode(enc.ids)) # reconstructed text