# Empedocles

**Evolutionary algorithms, in the browser.**

Interactive demos from my MSc in Artificial Intelligence (University of Southampton),
the *Evolution of Complexity* unit (COMP6202). Each one is a small window onto how blind
variation plus selection builds order — and onto the question that runs through the whole
course: **when does recombination (sex) actually help evolution?** No build step, no
dependencies, no server: everything runs entirely in the browser.

🔗 **[Live site](https://mikebertin.github.io/empedocles/)**

## The demos

| | | |
|---|---|---|
| **[Methinks (the Weasel)](methinks/)** | Cumulative selection | Dawkins' weasel program. A population of random strings evolves toward a target. **Watch** it converge, **Race** a hill-climber against genetic algorithms with and without crossover, and run the **Lab** experiments — fitness-evaluations-to-solve vs population size — yourself. |
| **HIFF — Modularity** | Building blocks | *(coming soon)* The Hierarchical-If-and-only-iff problem: nested building blocks where crossover is decisive and a mutation-only search stalls. The mirror image of the weasel. |
| **Fitness Landscapes** | Search difficulty | *(coming soon)* Tune ruggedness on an NK landscape and watch a population climb — why some problems are easy and others deceive. |

## The thread

The **weasel** shows cumulative selection crushing blind chance — but its characters are
independent (each is its own size-1 building block), so crossover only buys a modest edge.
**HIFF** is the deliberate opposite: a fitness function built from nested modules where
recombination is essential and mutation alone gets stuck. **Fitness landscapes** explain the
why — ruggedness and deception are what separate the two cases. Together they trace the
course's big idea: *recombination earns its keep exactly when a problem has reusable building
blocks to combine.*

## About Methinks

The Methinks demo is a faithful web port of my original coursework (Java, then Python). The
engine matches the Python implementation exactly:

- **Alphabet** — the 52 ASCII letters plus space.
- **Mutation** — each character is replaced with probability `1 / (odds · L)`, where `L` is the
  target length and `odds` is expressed relative to the textbook `1/L` rate (the mutation
  slider).
- **Three methods**
  - **Hill-climber** — every individual is mutated each generation; the mutant replaces its
    parent if at least as fit. A whole population of independent climbers.
  - **GA, no crossover** — steady-state: tournament-select the fitter of two random
    individuals, mutate it, and overwrite the less fit of two others.
  - **GA, with crossover** — tournament-select two parents, uniform-crossover them, mutate the
    child, and overwrite the less fit of a random pair.
- **Fitness** — the number of characters matching the target; a **fitness evaluation** is one
  such comparison, and counting them is how the methods are fairly compared.

The **Lab** tab reproduces the original matplotlib figure (evaluations-to-solve vs population
size, averaged over many runs) as a live, interactive chart.

## Running locally

It's all static files — open `index.html`, or serve the folder:

```sh
python3 -m http.server 8741
```

Then visit <http://localhost:8741>.

## The name

Named for [Empedocles](https://en.wikipedia.org/wiki/Empedocles) (c. 494–434 BC), the
pre-Socratic philosopher who imagined living things assembled from randomly combined
parts — heads, limbs, organs — with only the viable combinations surviving and reproducing.
An ancient, startlingly Darwinian glimpse of natural selection, twenty-three centuries early.

A companion to [Chiron](https://github.com/mikebertin/chiron), my computational-physics
playground from undergrad.
