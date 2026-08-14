# Security notes

- Host resolves the parent, fork prefix, model options, preset, workspace, and child id. The browser cannot supply those internal values.
- The create and close Remote accepts only the small fields required by the operation.
- Close can target only a child currently held by this plugin instance.
- Selection is limited to visible text inside one completed conversation message.
- The intended deployment is the normal local DSH Web/Desktop profile. Exposing the DSH Host to untrusted remote users requires a separate access-control review.
- Side Chat tools have the same workspace effects and approvals as ordinary DSH Sessions.
