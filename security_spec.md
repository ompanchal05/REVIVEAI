# ReviveAI Security Specification & Firestore Hardening Blueprint

## 1. Data Invariants
1. **Identity & Ownership**: A user cannot write or mutate recovery cases or audit logs without being authenticated (`request.auth != null`). The document's `owner_id` must match `request.auth.uid`.
2. **Terminal State Locking**: Once a recovery case reaches terminal status (`RECOVERED` or `TERMINAL_FAILED`), it cannot be modified by standard users.
3. **Immutability of Audit Trails**: Audit log entries are strictly append-only. No updates (`allow update: if false`) and no deletions (`allow delete: if false`) are allowed under any circumstances.
4. **Input Sanitization & Bounds**: All string fields have explicit `.size()` boundaries (e.g., ID <= 128 characters, reason <= 500 characters) matching `firebase-blueprint.json`.
5. **No Blind Global Reads**: Queries must be filtered by `resource.data.owner_id == request.auth.uid` or restricted to authenticated operators.
6. **PII Isolation**: Customer email and personal information must be isolated or restricted to authorized authenticated users.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Unauthenticated Read**: Attempting to read `/cases/case_1` with `request.auth == null` -> `PERMISSION_DENIED`.
2. **Identity Spoofing**: Attempting to create a case with `owner_id: "victim_user"` while authenticated as `"attacker_user"` -> `PERMISSION_DENIED`.
3. **Ghost Field Injection (Shadow Update)**: Attempting to insert an arbitrary field `is_admin_override: true` into a case -> `PERMISSION_DENIED`.
4. **Audit Tampering (Update)**: Attempting an `update` on an existing `/audit_logs/log_123` document -> `PERMISSION_DENIED`.
5. **Audit Deletion**: Attempting a `delete` on an `/audit_logs/log_123` document -> `PERMISSION_DENIED`.
6. **Terminal State Mutation**: Attempting to update a case whose status is already `RECOVERED` -> `PERMISSION_DENIED`.
7. **Resource Poisoning (1.5KB Document ID)**: Attempting to target a case with an ID longer than 128 chars -> `PERMISSION_DENIED`.
8. **Malicious Negative Amount**: Attempting to create a case with `amount: -5000` -> `PERMISSION_DENIED`.
9. **Illegal Status Enum Injection**: Attempting to create a case with `status: "FORCE_CREDIT"` -> `PERMISSION_DENIED`.
10. **Quiet Hours Format Poisoning**: Attempting to submit policy config with `quiet_hours_start: "BAD_FORMAT_STRING_TOO_LONG"` -> `PERMISSION_DENIED`.
11. **Client Delegation Query Scraping**: Attempting a collection list read without user filtering on `owner_id` -> `PERMISSION_DENIED`.
12. **Unverified Email Access**: Attempting sensitive administrative writes with an unverified email token -> `PERMISSION_DENIED`.
