# Firefish 的 ActivityPub 扩展

此处列举 Firefish 实现的 ActivityPub 协议扩展。本页使用[紧凑型IRI](https://www.w3.org/TR/json-ld/#dfn-compact-iri)表示法。其中 `firefish` 前缀指向 `https://firefish.dev/ns#` 命名空间。

## speakAsCat

- 紧凑型IRI: `firefish:speakAsCat`
- 标准IRI: `https://firefish.dev/ns#speakAsCat`

用于用户对象 (Actor)，表示该用户不仅自认为是猫，还希望系统自动将其文本转换为"喵言喵语"（如将句末助词"な"转换为"にゃ"等猫系语言风格），以布尔值形式表示。当该属性设为 true 时，展示用户帖子时会启用猫语转换功能。需与 [misskey:isCat](https://misskey-hub.net/ns/#iscat) 属性配合使用。
