from .base import Trainer
from .bpe_trainer import BPETrainer
from .wordlevel_trainer import WordLevelTrainer
from .unigram_trainer import UnigramTrainer
from abctokz.config.schemas import BPETrainerConfig, WordLevelTrainerConfig, UnigramTrainerConfig
from typing import Literal
def build_trainer(config:Literal[BPETrainerConfig, WordLevelTrainerConfig, UnigramTrainerConfig]) -> Trainer:
    """
    Factory function to instantiate the correct trainer 
    based on the provided configuration.
    """
    if isinstance(config, BPETrainerConfig):
        return BPETrainer(config)
    elif isinstance(config, WordLevelTrainerConfig):
        return WordLevelTrainer(config)
    elif isinstance(config, UnigramTrainerConfig):
        return UnigramTrainer(config)
    else:
        raise ValueError(f"Unsupported trainer config type: {type(config)}")

