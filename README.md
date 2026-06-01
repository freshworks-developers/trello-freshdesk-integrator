# Trello–Freshdesk integrator

Freshdesk ticket-sidebar app that links support tickets to **Trello** cards so agents and engineering can collaborate in one workflow. Create a Trello card from a ticket, keep card metadata in key-value storage, and sync Trello board comments back to the ticket as private notes.

## Real-world use case

Support teams often track escalations in Trello while agents work in Freshdesk. This sample shows a practical pattern: **create cards from tickets**, register a Trello webhook on install, and **mirror card comments** to Freshdesk notes so agents see engineering updates without leaving the helpdesk.

## Features

- Ticket sidebar UI to create, view, and delete linked Trello cards
- Serverless handlers for Trello API calls (lists, members, cards, labels)
- Webhook registration on app install; cleanup on uninstall
- External events: Trello comment create/update/delete → Freshdesk notes
- Key-value storage for card↔ticket and comment↔note mappings

## Prerequisites

- Freshdesk trial or dev account
- [FDK 10.x](https://developers.freshworks.com/docs/app-sdk/v3.0/) on **Node.js 24.x**
- Trello account, board ID, API key, and token ([Trello app key page](https://trello.com/app-key))

## Installation parameters

| Parameter | Description |
|-----------|-------------|
| `trelloBoardId` | Board to attach cards and webhooks |
| `trelloApiKey` / `trelloToken` | Trello API credentials |
| `freshdeskDomain` | Freshdesk domain host (e.g. `yourdomain.freshdesk.com`) |
| `freshdeskApiKey` | Freshdesk API key (Profile settings) |

## Setup and testing

1. From this app folder, run `fdk validate` then `fdk run`.
2. Open `http://localhost:10001/custom_configs` and enter iparams.
3. In Freshdesk, open a ticket and load the app sidebar (`?dev=true` locally if needed).
4. Create a Trello card from the ticket; add a comment on the card in Trello and confirm a note appears on the ticket.

## Project structure

- `manifest.json` — Platform 3.0 modules (`support_ticket` sidebar + common events/SMI)
- `app/` — Ticket sidebar UI and modals
- `config/requests.json` — Trello and Freshdesk request templates
- `server/server.js` — SMI, install/uninstall, and external-event handlers

## License

See repository defaults.
