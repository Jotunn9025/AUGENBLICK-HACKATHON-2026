from .base import Normalizer
from abctokz.config.schemas import SequenceNormalizerConfig,DevanagariNormalizerConfig,NfkcNormalizerConfig,WhitespaceNormalizerConfig,IdentityNormalizerConfig
from .devanagari import DevanagariNormalizer
from .unicode_nfkc import NfkcNormalizer
from .whitespace import WhitespaceNormalizer
from .identity import IdentityNormalizer
from .sequence import SequenceNormalizer
from typing import Literal
def build_normalizer(config: Literal[DevanagariNormalizerConfig, NfkcNormalizerConfig, WhitespaceNormalizerConfig, IdentityNormalizerConfig, SequenceNormalizerConfig]) -> Normalizer:
    """
    Factory function to instantiate the correct normalizer 
    based on the provided configuration.
    """
    if isinstance(config, DevanagariNormalizerConfig):
        return DevanagariNormalizer(config)
    elif isinstance(config, NfkcNormalizerConfig):
        return NfkcNormalizer(config)
    elif isinstance(config, WhitespaceNormalizerConfig):
        return WhitespaceNormalizer(config)
    elif isinstance(config, IdentityNormalizerConfig):
        return IdentityNormalizer(config)
    elif isinstance(config, SequenceNormalizerConfig):
        return SequenceNormalizer(
            normalizers=[build_normalizer(norm) for norm in config.normalizers]
        )
    else:
        raise ValueError(f"Unsupported normalizer config type: {type(config)}")

