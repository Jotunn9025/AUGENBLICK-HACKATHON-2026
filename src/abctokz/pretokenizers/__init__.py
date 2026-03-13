from .base import PreTokenizer
from abctokz.config.schemas import WhitespacePreTokenizerConfig, PunctuationPreTokenizerConfig, RegexPreTokenizerConfig, DevanagariAwarePreTokenizerConfig, SequencePreTokenizerConfig
from .devanagari_aware import DevanagariAwarePreTokenizer
from .punctuation import PunctuationPreTokenizer
from .whitespace import WhitespacePreTokenizer
from .regex import RegexPreTokenizer
from .sequence import SequencePreTokenizer
from typing import Literal
def build_pretokenizer(config: Literal[WhitespacePreTokenizerConfig, PunctuationPreTokenizerConfig, RegexPreTokenizerConfig, DevanagariAwarePreTokenizerConfig, SequencePreTokenizerConfig]) -> PreTokenizer:
    """
    Factory function to instantiate the correct normalizer 
    based on the provided configuration.
    """
    if isinstance(config, DevanagariAwarePreTokenizerConfig):
        return DevanagariAwarePreTokenizer(config)
    elif isinstance(config, PunctuationPreTokenizerConfig):
        return PunctuationPreTokenizer(config)
    elif isinstance(config, WhitespacePreTokenizerConfig):
        return WhitespacePreTokenizer(config)
    elif isinstance(config, RegexPreTokenizerConfig):
        return RegexPreTokenizer(config)
    elif isinstance(config, SequencePreTokenizerConfig):
        return SequencePreTokenizer(
            pretokenizers=[build_pretokenizer(norm) for norm in config.pretokenizers]
        )
    else:
        raise ValueError(f"Unsupported pretokenizer config type: {type(config)}")

