# Design record

## Goals

- Keep human-facing operating material readable in Markdown.
- Keep the coordination surface clearly separated from the Flight Finder application repository.

## Constraints

- Universal interface rules come from the shared harness.
- Application interface decisions live in `base-flight-finder`.

## Decisions

- This repository carries coordination documents and the local fast-flights sidecar.
- The Flight Finder application remains an independently versioned repository.
