# Pythonberoenden

`scripts/quick_validate.py` och `scripts/package_skill.py` behöver PyYAML.
Installera den låsta versionen från denna katalog i din virtuella miljö:

```sh
python -m pip install -r requirements.txt
```

Övriga Pythonimporter är standardbibliotek eller lokala moduler.
Evalueringsverktygen använder dessutom den separat installerade Claude CLI:n.

`eval-viewer/viewer.html` laddar SheetJS 0.20.3 från utgivarens CDN, med ett
SHA-384-integritetslås. Det är senaste utgåvan vid kontrollen 2026-11-19.
