# fifea-toolkit

> **EN:** A modern TypeScript toolkit for reading/writing classic EA Sports game file formats (Rx2/Rx3/DDS and related), aimed at offline modding and research.  
> **PT-BR:** Um toolkit moderno em TypeScript para ler/escrever formatos clássicos de jogos EA Sports (Rx2/Rx3/DDS e derivados), voltado para modding offline e pesquisa.

![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Overview / Visão geral

**EN:** `fifea-toolkit` is a TypeScript port of a legacy VB/.NET library previously known as **FifaLibrary22 / FIFALibrary.dll** (originally by **tokke001**).  
The goal is to keep parsing and serialization behavior **faithful** to the original implementation, while delivering a cleaner API, better docs, and a modern Node.js/TypeScript developer experience.

**PT-BR:** `fifea-toolkit` é um port em TypeScript de uma biblioteca legada em VB/.NET anteriormente conhecida como **FifaLibrary22 / FIFALibrary.dll** (originalmente por **tokke001**).  
O objetivo é manter o comportamento de leitura e escrita **fiel** ao original, enquanto entrega uma API mais organizada, documentação melhor e uma experiência moderna no ecossistema Node.js/TypeScript.

---

## Features / Recursos

### Rx2 (RenderWare-only)

**EN:** Read/write Rx2 files containing a “RenderWare” section only.  
**PT-BR:** Leitura/escrita de arquivos Rx2 contendo apenas a seção “RenderWare”.

Known compatibility / Compatibilidade conhecida:

- FIFA 07–09 (console)
- UEFA Champions League 06–07
- UEFA Euro 2008
- NHL 11

### Rx3 (Hybrid)

**EN:** Read/write Rx3 *hybrid* files (both “RenderWare” and “rx3” sections).  
**PT-BR:** Leitura/escrita de arquivos Rx3 *híbridos* (seções “RenderWare” e “rx3”).

Known compatibility / Compatibilidade conhecida:

- FIFA 10 (console)
- 2010 FIFA World Cup South Africa
- FIFA 11 (PC)
- FIFA Online 3 (old engine)

### Rx3 (non-hybrid)

**EN:** Read/write Rx3 files.  
**PT-BR:** Leitura/escrita de arquivos Rx3.

Known compatibility / Compatibilidade conhecida:

- FIFA 11 (console)
- FIFA 12 (or later)

### DDS

**EN:** Read/write DDS textures and related utilities used by pipelines.  
**PT-BR:** Leitura/escrita de DDS e utilitários relacionados usados em pipelines.

### glare.bin (older titles)

**EN:** Read `glare.bin` files (seen in older titles).  
**PT-BR:** Leitura de `glare.bin` (usado em jogos mais antigos).

Examples / Exemplos:

- NHL 11
- FIFA 08 (console)

### crowdplacement `.dat`

**EN:** Read/write crowdplacement `.dat` formats.  
**PT-BR:** Leitura/escrita de `.dat` de crowdplacement.

Versions / Versões:

- Crowd v3: FIFA 07–14
- Crowd v4: WC 14
- Crowd v5: FIFA 15–22

---

## Project status / Status do projeto

**EN:** This project is under active migration from VB to TypeScript.  
Porting rules:

- keep functions, return values, and behavior as close as possible to the VB original;
- do not “guess” unknown custom dependencies: they are ported as they appear and connected later;
- prioritize correctness and binary compatibility.

**PT-BR:** Este projeto está em migração ativa de VB para TypeScript.  
Regras do port:

- manter funções, retornos e comportamento o mais próximo possível do VB original;
- não “chutar” dependências customizadas desconhecidas: elas são portadas conforme aparecem e conectadas depois;
- priorizar correção e compatibilidade binária.

---

## Installation / Instalação

**EN:** Not published yet (WIP). When available on npm:  
**PT-BR:** Ainda não publicado (WIP). Quando estiver no npm:

```bash
npm i fifea-toolkit
```

## Requirements / Requisitos

- Node.js 18+ (recommended 22+) / Node.js 18+ (recomendado 22+)
- TypeScript 5+ / TypeScript 5+

## Quick start / Início rápido

**EN:** Examples below illustrate the intended usage. Names/paths may change while the API stabilizes.

**PT-BR:** Os exemplos abaixo ilustram o uso pretendido. Nomes/paths podem mudar enquanto a API estabiliza.

### Read an Rx3 file / Ler um Rx3

```ts
    import { Rx3File } from 'fifea-toolkit'
    import { readFileSync } from 'node:fs'

    const buffer = readFileSync('assets/example.rx3')
    const rx3 = Rx3File.fromBuffer(buffer)

    console.log(rx3.header)
    console.log(rx3.sections.map(s => s.type))
```

## Notes / Observações

### Compatibility / Compatibilidade

**EN:** Rx2/Rx3 variants can differ by game, year, and platform. If a file fails to parse, it may be due to:

- container variation,
- extra/unknown sections,
- different endianness,
- platform-specific differences.

**PT-BR:** Variações de Rx2/Rx3 podem mudar por jogo, ano e plataforma. Se um arquivo falhar, pode ser por:

- variação do container,
- seções extras/desconhecidas,
- endianness diferente,
- diferenças específicas de plataforma.

### Offline modding focus / Foco em modding offline

**EN:** This toolkit is intended for offline file manipulation and research. It does not include or encourage online cheating or bypassing protections.

**PT-BR:** Este toolkit é voltado para manipulação de arquivos offline e pesquisa. Não inclui nem incentiva trapaça online ou bypass de proteções.

### Credits / Créditos

**EN:** Original VB/.NET source: tokke001 (FIFALibrary.dll / FifaLibrary22).
This project: TypeScript port, modernization, documentation, and ongoing maintenance: fifea-toolkit.

**PT-BR:** Código fonte VB/.NET original: tokke001 (FIFALibrary.dll / FifaLibrary22).
Este projeto: port para TypeScript, modernização, documentação e manutenção contínua: fifea-toolkit.
