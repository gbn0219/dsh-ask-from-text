# 划词追问 · Ask from Text

在 DeepSeek Harness 的回答里划选一句话，输入追问；回答会在独立的浮窗中继续，并保留原文标记。

![多个追问与收起列表](https://cdn.jsdelivr.net/gh/gbn0219/dsh-ask-from-text@main/docs/images/multi-branch.jpg)

> 界面示意图。当前版本新建追问时只弹出一个输入浮窗；发送后才会显示完整对话浮窗。

## 安装

需要 DeepSeek Harness 0.2.2-rc.x。

### 从 GitHub 安装（当前可用）

```sh
dsh plugin --profile web add github:gbn0219/dsh-ask-from-text
```

### 从 npm 安装（发布后可用）

```sh
dsh plugin --profile web add dsh-ask-from-text
```

### 从本地目录安装

```sh
dsh plugin --profile web add /absolute/path/to/dsh-ask-from-text
```

也可以打开 DSH Desktop 的 **插件 → 添加插件**，选择本地插件目录。

安装完成后，完全退出 DSH 重开，或刷新 Web 页面。打开 **插件**，确认 `划词追问` 已启用。

## 使用

### 1. 划选文字

在一条**已经生成完成**的 assistant 回答中划选文字。

选区附近会出现 `✦ 追问` 按钮。点击它。

> 正在生成中的回答、用户消息、工具参数编辑区，以及浮窗自身不能作为追问对象。

### 2. 输入第一个问题

会弹出一个独立的输入浮窗：

- 输入问题；
- 按 `Enter` 或点「发送」；
- 发送成功后，输入浮窗消失，出现这个追问的对话浮窗。

选中的原文会留在主对话里，并显示彩色下划线和行尾编号 `#1`。

### 3. 继续追问或创建子分支

在追问的对话浮窗中：

- 直接使用底部的原生输入框继续追问；
- 在回答里继续划选文字，可以创建子分支。

每个追问只继承它的父级及祖先内容；兄弟分支之间互不可见。

### 4. 收起和恢复

- 点浮窗头部的 `—` 收起；
- 收起后，原文仍保留彩色下划线和 `#n`；
- 点击 `#n`，或在右下角「已收起分支」列表里点一行，可以重新打开；
- 点击收起列表里的一行时，原文会自动滚到页面中央。

### 5. 放大

点浮窗头部的 `↗` 进入舞台。

舞台中可以使用：

- `← 后退` / `前进 →`：在查看过的分支之间切换；
- `主对话 › #n`：点击面包屑跳转；
- `▤ 分支树`：查看完整分支树；
- `↘ 还原为浮窗`：回到小浮窗；
- `✕ 关闭`：回到主对话。

![舞台与分支树](https://cdn.jsdelivr.net/gh/gbn0219/dsh-ask-from-text@main/docs/images/stage-and-tree.jpg)

### 6. 删除草稿

还没有发送的追问是草稿，可以在三个地方点红色 `⌫` 删除：

- 输入浮窗头部；
- 右下角「已收起分支」列表；
- 舞台里的分支树。

已经发送的追问是真实会话，插件不提供删除；需要时请到 DSH 的 Session 列表归档。

### 7. 左侧栏折叠

每个追问都会作为真实 Session 出现在左侧栏。

它们会被归入 `追问分支` 分组；点分组标题即可收起或展开，不影响主对话和其他会话。主对话行会固定显示在分支分组之上，即使某个分支的最近活跃时间更靠后。

## 使用须知

- 追问回答是真实的 DSH Session，可以使用思考、工具调用、Stop 和原生输入框。
- 分支只看到父级和祖先内容，不看到兄弟分支，也不会自动获得父级后来新增的内容。
- 分支对话会出现在普通 Session 列表中，这是正常现象。
- 当前浮窗和舞台的运行时按钮文案为中文；插件管理器的标题/描述提供中英文。
- 目前主要面向 DSH Desktop；Web 共用同一套 UI，窄屏体验尚未专门优化。

## 常见问题

**为什么左侧栏多出了会话？**  
每个追问都是真实 Session。用 `追问分支` 分组收起即可。

**可以删除已发送的追问吗？**  
插件不提供；已发送的分支需要在 DSH 的 Session 列表中归档。只有草稿可以 `⌫` 删除。

**为什么原文没有跳到中间？**  
如果原文所在的轮次被折叠或尚未加载，插件会先尝试加载；仍失败时请把这一轮的对话展开后再点一次。

**会把我的对话发到其他地方吗？**  
不会。插件不发起网络请求；对话由 DSH 自己的 Session 和模型链路处理。

## English

**Ask from Text** lets you select a sentence in a completed assistant answer and ask a question in a separate floating branch, while keeping the original text marked in place.

![Multiple branches and the collapsed-branch list](https://cdn.jsdelivr.net/gh/gbn0219/dsh-ask-from-text@main/docs/images/multi-branch.jpg)

> Interface illustration. In the current version a new follow-up opens only an input window; the full conversation window appears after you send the first question.

### Install

Requires DeepSeek Harness 0.2.2-rc.x.

#### From GitHub (available now)

```sh
dsh plugin --profile web add github:gbn0219/dsh-ask-from-text
```

#### From npm (after the npm release)

```sh
dsh plugin --profile web add dsh-ask-from-text
```

#### From a local directory

```sh
dsh plugin --profile web add /absolute/path/to/dsh-ask-from-text
```

You can also open **Plugins → Add plugin** in DSH Desktop and choose the local plugin directory.

After installation, fully quit and reopen DSH, or refresh the Web page. Open **Plugins** and confirm that **Ask from Text** is enabled.

### Usage

#### 1. Select text

Select text in a **completed** assistant answer.

A `✦ 追问` button appears near the selection. Click it.

> Streaming answers, user messages, tool argument editors, and the plugin's own windows cannot be used as follow-up sources.

#### 2. Enter the first question

An independent input window opens:

- Type your question.
- Press `Enter` or click **Send**.
- After the question is accepted, the input window disappears and the branch conversation window appears.

The selected text stays in the main transcript with a colored underline and a gutter number such as `#1`.

#### 3. Continue or create a child branch

In the branch conversation window:

- Use the native composer at the bottom to continue the conversation.
- Select text inside the branch answer to create a child branch.

A branch inherits its parent and ancestors only. Sibling branches cannot see one another.

#### 4. Collapse and restore

- Click `—` in the window header to collapse the branch.
- The source text keeps its colored underline and `#n` marker.
- Click the `#n` marker, or a row in the bottom-right **Collapsed branches** list, to reopen it.
- Opening a row scrolls the exact quoted range to the center of the transcript.

#### 5. Open the stage

Click `↗` in the window header to open the branch on the stage.

The stage provides:

- `← Back` / `Forward →` to move through branches you have viewed.
- `Main chat › #n` breadcrumbs to jump to a level.
- `▤ Branches` to open the full branch tree.
- `↘ Restore to window` to return to the floating window.
- `✕ Close` to return to the main chat.

![Stage and branch tree](https://cdn.jsdelivr.net/gh/gbn0219/dsh-ask-from-text@main/docs/images/stage-and-tree.jpg)

#### 6. Delete a draft

A follow-up that has not been sent is a draft. Delete it with the red `⌫` action in:

- The input window header.
- The bottom-right collapsed-branch list.
- The branch tree on the stage.

A sent follow-up is a real Session and cannot be deleted by the plugin. Archive it from the DSH Session list instead.

#### 7. Collapse branches in the left sidebar

Every follow-up appears as a real Session in the left sidebar.

These sessions are grouped under a `追问分支` header. Click the header to collapse or expand the group without affecting the main chat or other sessions. The main-chat row stays above the branch group even when a branch was used more recently.

### Notes

- A follow-up is a real DSH Session. It can use reasoning, tool calls, Stop, and the native composer.
- A branch sees its parent and ancestors, not siblings, and does not automatically receive later turns added to its parent.
- Branch conversations also appear in the normal Session list. This is expected.
- Runtime UI labels are currently Chinese; Plugin Manager metadata is available in Chinese and English.
- DSH Desktop is the primary target. The Web client shares the same UI, but narrow-screen behavior has not been specifically polished.

### FAQ

**Why are there extra sessions in the left sidebar?**  
Each follow-up is a real Session. Use the `追问分支` group to collapse them.

**Can I delete a sent follow-up?**  
Not from the plugin. Archive sent branches from the DSH Session list. Only drafts can be deleted with `⌫`.

**Why did the source text not scroll to the center?**  
If its Turn is folded or not loaded yet, the plugin tries to load it first. If that still fails, expand that Turn and click the branch again.

**Does this send my conversation anywhere else?**  
No. The plugin makes no network requests; conversations use DSH's own Session and model paths.

## License

[MIT](LICENSE) © 2026 gbn0219
