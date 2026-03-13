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
    if isinstance(config, WhitespacePreTokenizerConfig):
        return WhitespacePreTokenizer()
    if isinstance(config, PunctuationPreTokenizerConfig):
        return PunctuationPreTokenizer(behavior=config.behavior)
    if isinstance(config, RegexPreTokenizerConfig):
        return RegexPreTokenizer(pattern=config.pattern, invert=config.invert)
    if isinstance(config, DevanagariAwarePreTokenizerConfig):
        return DevanagariAwarePreTokenizer(
            split_on_whitespace=config.split_on_whitespace,
            split_on_script_boundary=config.split_on_script_boundary,
        )
    if isinstance(config, SequencePreTokenizerConfig):
        return SequencePreTokenizer([build_pretokenizer(c) for c in config.pretokenizers])
    raise ValueError(f"Unknown pre-tokenizer config type: {type(config)}")
