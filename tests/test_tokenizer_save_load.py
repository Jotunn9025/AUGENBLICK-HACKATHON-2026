from abctokz import AugenblickTokenizer
from abctokz.config.schemas import TokenizerConfig, BPEConfig, IdentityNormalizerConfig, WhitespacePreTokenizerConfig

schema = TokenizerConfig(
    model=BPEConfig(),
    normalizer=IdentityNormalizerConfig(),
    pretokenizer=WhitespacePreTokenizerConfig()
)

tokenizer = AugenblickTokenizer.from_config(schema)

import shutil
try:
    shutil.rmtree("test_output")
except:
    pass

tokenizer.save("test_output")

loaded_tokenizer = AugenblickTokenizer.load("test_output")
print("Loaded norm:", loaded_tokenizer._normalizer)
print("Loaded pre:", loaded_tokenizer._pretokenizer)
print("Config:", loaded_tokenizer._config)
