# Graph Report - .  (2026-05-20)

## Corpus Check
- 137 files · ~80,632 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 347 nodes · 331 edges · 17 communities detected
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]

## God Nodes (most connected - your core abstractions)
1. `useAppState()` - 25 edges
2. `GoogleSheetService` - 11 edges
3. `UserService` - 10 edges
4. `AdminData.tsx` - 7 edges
5. `getUserLimits()` - 7 edges
6. `fetchWithRetry()` - 6 edges
7. `parseJSONWithComments()` - 6 edges
8. `GoogleDriveService` - 5 edges
9. `useWindowSize()` - 4 edges
10. `updateState()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `UserSettings()` --calls--> `getUserLimits()`  [INFERRED]
  app/settings/page.tsx → utils/helpers.ts
- `useAppState()` --calls--> `AdminDashboard()`  [INFERRED]
  app/context/AppContext.tsx → app/root/page.tsx
- `useAppState()` --calls--> `UserSettings()`  [INFERRED]
  app/context/AppContext.tsx → app/settings/page.tsx
- `handleProceed()` --calls--> `convertToPaymentResponse()`  [INFERRED]
  app/components/admin/wallet/FundWalletModal.tsx → app/types/wallet.ts

## Communities (72 total, 9 thin omitted)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (4): fetchCampaigns(), transformCampaignData(), UserSettings(), getUserLimits()

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (7): handleLogout(), restoreSession(), AppProvider(), LoadingProvider(), useLoading(), BackendError, setAppState()

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (5): BaseModel, UserLoginRequest, UserRegisterRequest, UserService, VerifyAccountRequest

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (3): cleanJSONString(), parseJSONWithComments(), safeParseJSON()

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (9): getFirstUrl(), getTemplateIndex(), handleSubmit(), handleTemplateSelection(), isValidUrl(), nextStage(), renderTemplatePreview(), renderTemplateVariables() (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.28
Nodes (4): handleAddRedirectPath(), handleSaveEditedPath(), isValidURL(), isRedirectConnectedToProject()

### Community 14 - "Community 14"
Cohesion: 0.43
Nodes (7): fetchAdminData(), fetchAllTickets(), fetchAllUsers(), fetchTicketData(), fetchUserData(), fetchWithRetry(), AdminData.tsx

### Community 21 - "Community 21"
Cohesion: 0.6
Nodes (5): handleCodeSubmit(), handleEmailSubmit(), handlePasswordSubmit(), updateState(), validatePassword()

## Knowledge Gaps
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppState()` connect `Community 0` to `Community 2`, `Community 3`, `Community 7`, `Community 8`, `Community 11`, `Community 16`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`?**
  _High betweenness centrality (0.223) - this node is a cross-community bridge._
- **Why does `getUserLimits()` connect `Community 2` to `Community 5`, `Community 13`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useAppState()` (e.g. with `AdminDashboard()` and `UserSettings()`) actually correct?**
  _`useAppState()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._