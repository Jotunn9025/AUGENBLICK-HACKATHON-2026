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
    if isinstance(config, IdentityNormalizerConfig):
        return IdentityNormalizer()
    if isinstance(config, NfkcNormalizerConfig):
        return NfkcNormalizer(strip_zero_width=config.strip_zero_width)
    if isinstance(config, WhitespaceNormalizerConfig):
        return WhitespaceNormalizer(strip=config.strip, collapse=config.collapse)
    if isinstance(config, DevanagariNormalizerConfig):
        return DevanagariNormalizer(
            nfc_first=config.nfc_first, strip_zero_width=config.strip_zero_width
        )
    if isinstance(config, SequenceNormalizerConfig):
        return SequenceNormalizer([build_normalizer(c) for c in config.normalizers])
    raise ValueError(f"Unknown normalizer config type: {type(config)}")
