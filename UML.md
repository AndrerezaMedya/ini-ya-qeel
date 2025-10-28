# OOP-style Architecture (Mermaid UML)

This document models the codebase as a set of logical classes and services using Mermaid diagrams. The project is primarily functional/imperative JS, but the diagrams below translate modules and responsibilities into OOP concepts to make architecture, boundaries, and interactions clearer for maintainers.

Class names are logical groupings that map to files (see mapping table below).

---

## Class Diagram

```mermaid
classDiagram
    %% Frontend / UI Layer
    class AppController {
      +currentPageId
      +initializeApp()
      +setupEventListeners()
      +collectCircleScores()
      +collectStories()
      +submitFinalData()
      +openGacha()
      +closeGacha()
    }

    class GachaManager {
      +gachaInventory
      +currentState
      +setupGacha()
      +startPullAnimation()
      +handlePullResult()
      +logPull() // calls GSHandler.logGachaPull
    }

    class AudioManager {
      +music
      +sfx
      +initializeAudio()
      +loadTrack(type,index)
      +togglePlayPause()
    }

    class Inventory {
      +items
      +loadInventory()
      +saveInventory()
      +addToInventory(item)
    }

    class SubmissionPayload {
      +scores
      +happyStory
      +sadStory
      +audioData
      +browserId
      +ipAddress
      +sessionId
      +toRequestBody()
    }

    class UIComponents {
      +renderInventory()
      +updatePlayerUI()
      +showGachaHintOnce()
    }

    %% Backend / Apps Script
    class GSHandler {
      +doPost(e)
      +handleGachaLog(data)
      +handleGeminiFeedback(data)
      +_saveAudioIfAny(folderId, base64, mime, hint)
    }

    class DriveService {
      +createFile(blob)
      +setPublic(fileId)
    }

    class SheetService {
      +appendRow(sheetId,row)
      +updateByReqId(sheetId,reqId,col,text)
      +ensureSheet(sheetId,name)
    }

    class CacheServiceWrapper {
      +put(key,val,ttl)
      +get(key)
    }

    class GeminiService {
      +generate(member,scores,happy,sad,depth)
      +selfTest()
    }

    class PromptBuilder {
      +buildPrompt(member,scores,happy,sad,coach,depth)
    }

    %% Utilities
    class Utils {
      +normalizeScores(obj)
      +safeCell(v)
      +buildSubmitSig(data)
      +mimeToExt(mime)
    }

    %% Relationships
    AppController --> UIComponents : uses
    AppController --> AudioManager : delegates audio
    AppController --> GachaManager : delegates gacha
    AppController --> Inventory : reads/writes
    AppController --> SubmissionPayload : builds

    SubmissionPayload --> GSHandler : submit()
    GachaManager --> GSHandler : logPull()
    GSHandler --> DriveService : upload audio
    GSHandler --> SheetService : append/update rows
    GSHandler --> GeminiService : generate feedback
    GSHandler --> CacheServiceWrapper : store cache
    GSHandler --> Utils : uses
    GSHandler --> PromptBuilder : build prompt
    PromptBuilder --> GeminiService : format request

    AudioManager --> Utils : mimeToExt
    Inventory --> CacheServiceWrapper : optional
```

---

> Notes:
> - `SubmissionPayload` is a conceptual wrapper for the object built in `submitFinalData` before making the POST request; it holds Circle of Life scores, happy/sad stories, audio, and identifiers.
> - `GSHandler` represents the Apps Script backend (implements `doPost`, audio save helpers, gacha logging, and Gemini feedback helpers) in `shareable/codegs.js`.
> - `PromptBuilder` encapsulates the prompt that combines scores + stories before calling Gemini inside `handleGeminiFeedback`.

## Sequence: Submission Flow (simplified)

```mermaid
sequenceDiagram
    participant UI as Frontend (AppController)
  participant Payload as SubmissionPayload
    participant G as GSHandler (Apps Script)
    participant Drive as Google Drive
    participant SheetP as Public Sheet
    participant SheetPr as Private Sheet
    participant Gemini as GeminiService
  participant Prompt as PromptBuilder

  UI->>Payload: collectCircleScores()+collectStories()
  Payload-->>UI: request body (scores, stories, audio, ids)
    UI->>G: POST / doPost(payload)  // submit (scores, stories, audioBase64, browserId, sessionId)
    G->>Drive: _saveAudioIfAny(base64) -> fileMeta
    G->>SheetP: appendRow(publicRow w/ audioUrl + reqId)
    G->>SheetPr: appendRow(privateRow w/ browserId, ip, reqId)
    G->>Cache: put(memberByReq, memberName)
    G->>G: _backfillReqIdInGachaLog(sessionId, reqId)
    G->>UI: 200 OK { status: success, reqId }
    Note over G,Gemini: optionally call handleGeminiFeedback (separate action)
    UI->>G: POST action=geminiFeedback (reqId)
  G->>Prompt: buildPrompt(scores,happy,sad,coach,depth)
  Prompt-->>G: prompt text
  G->>Gemini: generate(member,scores,happy,sad,depth)
    Gemini-->>G: text
    G->>SheetP: updateByReqId(reqId, aiShort/aiLong, text)
    G->>SheetPr: updateByReqId(reqId, aiShort/aiLong, text)
    G->>UI: return feedbackText
```

---

## Sequence: Gacha Pull Flow

```mermaid
sequenceDiagram
    participant UI as Frontend (AppController / GachaManager)
    participant Local as Local Inventory & UI
    participant G as GSHandler

    UI->>UI: startPullAnimation()
    UI->>Local: determinePullResult() // local RNG + asset
    Local-->>UI: showResult(item, rarity)
    UI->>Local: addToInventory(item)
    UI->>G: POST action=logGachaPull { browserId, sessionId, itemName, rarity, reqId? }
    G-->>UI: { status: gacha_item_logged }
```

---

## Class → File Mapping (practical)

- AppController → `shareable/main.js` (functions: initializeApp, setupEventListeners, submit flows)
- GachaManager → `shareable/main.js` (functions: setupGacha, startPullAnimation, handle results)
- AudioManager → `shareable/main.js` (initializeAudio, loadTrack, togglePlayPause)
- Inventory → `shareable/main.js` (sessionStorage helpers: loadInventory, saveInventory, addToInventory)
- SubmissionPayload → `shareable/main.js` (object assembled in `submitFinalData` before POST; holds scores, stories, audio, ids)
- UIComponents → `shareable/main.js` (renderInventory, UI helpers)
- GSHandler → `shareable/codegs.js` (doPost, handleGeminiFeedback, handleGachaLog)
- DriveService → `shareable/codegs.js` (encapsulated in \_saveAudioIfAny)
- SheetService → `shareable/codegs.js` (\_mustSheet, \_appendRowSafe, \_updateAiFeedbackByReqId)
- CacheServiceWrapper → `shareable/codegs.js` (CacheService.getScriptCache usage)
- PromptBuilder → `shareable/codegs.js` (`handleGeminiFeedback` builds prompts combining scores + stories)
- GeminiService → `shareable/codegs.js` (callGemini\_, geminiFeedbackSelfTestAll)
- Utils → `shareable/codegs.js` and `shareable/main.js` (normalizeScores*, safeCell*, mimeToExt*, buildSubmitSig*)

---

## Guidance & Notes

- This OOP mapping is conceptual: the codebase uses functions/closures rather than classes. The diagram groups related functions into logical classes to aid understanding and onboarding.
- If you want a real refactor into ES6 classes/modules, I can scaffold class wrappers for each logical unit (e.g., `class GachaManager { ... }`) and add unit tests.
- To render Mermaid locally: GitHub, VS Code Mermaid Preview, or mermaid.live work well. The diagrams in this file use standard Mermaid classDiagram & sequenceDiagram syntax.

---
