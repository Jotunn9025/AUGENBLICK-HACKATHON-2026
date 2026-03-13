import os
from abctokz import AugenblickTokenizer
from abctokz.config.schemas import TokenizerConfig, BPEConfig, IdentityNormalizerConfig, WhitespacePreTokenizerConfig, BPETrainerConfig

schema = TokenizerConfig(
    model=BPEConfig(),
    trainer=BPETrainerConfig(vocab_size=10, min_frequency=1),
    normalizer=IdentityNormalizerConfig(),
    pretokenizer=WhitespacePreTokenizerConfig()
)

corpus = ["hello world", "test hello", "world test"]
with open("test_corpus.txt", "w") as f:
    f.write("\n".join(corpus))

tokenizer = AugenblickTokenizer.from_config(schema)
tokenizer.train(["test_corpus.txt"], schema)

tokenizer.save("trained_output")

with open("trained_output/config.json") as f:
    print("CONFIG JSON:\n", f.read())

loaded = AugenblickTokenizer.load("trained_output")
print("TEST LOADED CONFIG:", loaded._config)

import shutil
try:
    shutil.rmtree("trained_output")
    os.remove("test_corpus.txt")
except:
    pass
