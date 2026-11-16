/**
 * Inline follow-up: select text in a finalized answer, open a floating branch,
 * fork the session at the selected event, and render the branch with the shared
 * Conversation Factory.
 *
 * The plugin deliberately keeps the branch content in real DSH sessions. The
 * store here only owns UI metadata (tree, anchors, colors, panel state).
 */
window.__ModuleLoader__.load({
  id: 'dsh-ask-from-text',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const {
      useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore,
    } = React

    const NS = 'inlineFollowup'
    const STORAGE_KEY = 'dsh.inline-followup.v1'
    const MAX_QUOTE = 4000
    const PANEL_WIDTH = 420
    const COLORS = [
      { light: '#C25A3A', lightTint: '#F7E6DF', dark: '#F08A68', darkTint: 'rgba(240,138,104,.16)' },
      { light: '#207F73', lightTint: '#DFF1ED', dark: '#5FC9B8', darkTint: 'rgba(95,201,184,.15)' },
      { light: '#5B63C4', lightTint: '#E7E8FA', dark: '#9AA4FF', darkTint: 'rgba(154,164,255,.15)' },
      { light: '#A66B12', lightTint: '#F7EBD8', dark: '#E3B05E', darkTint: 'rgba(227,176,94,.15)' },
      { light: '#B0446E', lightTint: '#F7E3EC', dark: '#E889B0', darkTint: 'rgba(232,137,176,.15)' },
      { light: '#3D6FA8', lightTint: '#E3EDF8', dark: '#7FB2E8', darkTint: 'rgba(127,178,232,.15)' },
      { light: '#7A4FA8', lightTint: '#EEE4F8', dark: '#C29BE8', darkTint: 'rgba(194,155,232,.15)' },
      { light: '#5F7A2E', lightTint: '#EAF0DC', dark: '#A9C46A', darkTint: 'rgba(169,196,106,.15)' },
    ]

    const DICT = {
      zh: {
        chip: '追问',
        chipHint: '针对选中文字创建独立分支',
        branch: '分支',
        branchN: '分支',
        basedOn: '基于',
        main: '主对话',
        independent: '独立分支',
        draft: '草稿',
        sending: '建立中',
        running: '运行中',
        ready: '已创建',
        failed: '失败',
        send: '发送',
        sendingAction: '发送中…',
        quote: '已引用',
        defaultQuestion: '请针对这段内容继续说明。',
        empty: '在这里补充你的问题…',
        sendHint: 'Enter 发送 · Shift + Enter 换行',
        collapse: '收起',
        input: '输入',
        deleteDraft: '删除草稿',
        close: '关闭',
        expand: '放大',
        restore: '还原为浮窗',
        back: '后退',
        forward: '前进',
        stageHint: '后退 / 前进只切换正在查看的分支，不改变模型上下文。',
        path: '路径',
        all: '全部',
        tree: '分支树',
        current: '当前',
        dock: '已收起的分支',
        open: '打开',
        retry: '重试',
        error: '发送失败',
        forkError: '无法创建分支',
        noSession: '当前会话不可用',
        tooLong: '选择过长，请缩短后再试',
        content: '正文',
        quoteLabel: '引用自',
        showQuote: '展开引用',
        hideQuote: '收起引用',
        switchBranch: '切换到此分支',
        stages: '个节点',
        collapseDock: '收起列表',
        expandDock: '展开列表',
        sidebarGroup: '追问分支',
        context: '上下文',
        contextStart: '上下文起点',
        waiting: '待提问',
        treeNote: '当前模型上下文：{context}。兄弟分支不在其中。',
        anchorMissing: '#{n} 的原文当前不可见，可能已被折叠或尚未加载',
        draftWait: '在下方输入浮窗中提问',
      },
      en: {
        chip: 'Ask',
        chipHint: 'Ask about the selected text in an independent branch',
        branch: 'Branch',
        branchN: 'Branch',
        basedOn: 'based on',
        main: 'Main chat',
        independent: 'Independent branch',
        draft: 'Draft',
        sending: 'Opening',
        running: 'Running',
        ready: 'Ready',
        failed: 'Failed',
        send: 'Send',
        sendingAction: 'Sending…',
        quote: 'Quoted',
        defaultQuestion: 'Please explain this passage further.',
        empty: 'Add your question…',
        sendHint: 'Enter to send · Shift + Enter for a new line',
        collapse: 'Collapse',
        input: 'Input',
        deleteDraft: 'Delete draft',
        close: 'Close',
        expand: 'Expand',
        restore: 'Restore panel',
        back: 'Back',
        forward: 'Forward',
        stageHint: 'Back / forward only changes the branch you are viewing; it does not change model context.',
        path: 'Path',
        all: 'All',
        tree: 'Branches',
        current: 'Current',
        dock: 'Collapsed branches',
        open: 'Open',
        retry: 'Retry',
        error: 'Send failed',
        forkError: 'Could not create branch',
        noSession: 'Session unavailable',
        tooLong: 'Selection is too long',
        content: 'Text',
        quoteLabel: 'Quoted from',
        showQuote: 'Show quote',
        hideQuote: 'Hide quote',
        switchBranch: 'Switch to this branch',
        stages: 'nodes',
        collapseDock: 'Collapse list',
        expandDock: 'Expand list',
        sidebarGroup: 'Branches',
        context: 'Context',
        contextStart: 'Context root',
        waiting: 'Waiting for question',
        treeNote: 'Current model context: {context}. Sibling branches are not included.',
        anchorMissing: 'Source text for #{n} is not visible; it may be folded or not loaded yet',
        draftWait: 'Ask in the input window below',
      },
      ja: {
        chip: '質問',
        chipHint: '選択したテキストについて独立したブランチで質問',
        branch: 'ブランチ',
        branchN: 'ブランチ',
        basedOn: '基準',
        main: 'メイン会話',
        independent: '独立ブランチ',
        draft: '下書き',
        sending: '作成中',
        running: '実行中',
        ready: '作成済み',
        failed: '失敗',
        send: '送信',
        sendingAction: '送信中…',
        quote: '引用済み',
        defaultQuestion: 'この内容についてさらに説明してください。',
        empty: 'ここに質問を追加…',
        sendHint: 'Enter で送信 · Shift + Enter で改行',
        collapse: '折りたたむ',
        input: '入力',
        deleteDraft: '下書きを削除',
        close: '閉じる',
        expand: '拡大',
        restore: 'パネルに戻す',
        back: '戻る',
        forward: '進む',
        stageHint: '戻る / 進むは表示中のブランチを切り替えるだけで、モデルのコンテキストは変わりません。',
        path: 'パス',
        all: 'すべて',
        tree: 'ブランチツリー',
        current: '現在',
        dock: '折りたたんだブランチ',
        open: '開く',
        retry: '再試行',
        error: '送信に失敗しました',
        forkError: 'ブランチを作成できません',
        noSession: '現在のセッションは利用できません',
        tooLong: '選択が長すぎます。短くしてもう一度お試しください',
        content: '本文',
        quoteLabel: '引用元',
        showQuote: '引用を表示',
        hideQuote: '引用を隠す',
        switchBranch: 'このブランチに切り替え',
        stages: '個のノード',
        collapseDock: 'リストを折りたたむ',
        expandDock: 'リストを展開',
        sidebarGroup: '質問ブランチ',
        context: 'コンテキスト',
        contextStart: 'コンテキストの起点',
        waiting: '質問待ち',
        treeNote: '現在のモデルコンテキスト：{context}。兄弟ブランチは含まれません。',
        anchorMissing: '#{n} の原文は現在表示できません。折りたたまれているか、まだ読み込まれていない可能性があります',
        draftWait: '下の入力ウィンドウで質問してください',
      },      es: {
        chip: 'Preguntar',
        chipHint: 'Pregunta sobre el texto seleccionado en una rama independiente',
        branch: 'Rama',
        branchN: 'Rama',
        basedOn: 'basado en',
        main: 'Chat principal',
        independent: 'Rama independiente',
        draft: 'Borrador',
        sending: 'Creando',
        running: 'En ejecución',
        ready: 'Creado',
        failed: 'Falló',
        send: 'Enviar',
        sendingAction: 'Enviando…',
        quote: 'Citado',
        defaultQuestion: 'Explica este contenido con más detalle.',
        empty: 'Añade tu pregunta…',
        sendHint: 'Enter para enviar · Shift + Enter para nueva línea',
        collapse: 'Contraer',
        input: 'Entrada',
        deleteDraft: 'Eliminar borrador',
        close: 'Cerrar',
        expand: 'Ampliar',
        restore: 'Restaurar panel',
        back: 'Atrás',
        forward: 'Adelante',
        stageHint: 'Atrás / Adelante solo cambia la rama que estás viendo; no cambia el contexto del modelo.',
        path: 'Ruta',
        all: 'Todo',
        tree: 'Árbol de ramas',
        current: 'Actual',
        dock: 'Ramas contraídas',
        open: 'Abrir',
        retry: 'Reintentar',
        error: 'Error al enviar',
        forkError: 'No se pudo crear la rama',
        noSession: 'Sesión no disponible',
        tooLong: 'La selección es demasiado larga',
        content: 'Texto',
        quoteLabel: 'Citado de',
        showQuote: 'Mostrar cita',
        hideQuote: 'Ocultar cita',
        switchBranch: 'Cambiar a esta rama',
        stages: 'nodos',
        collapseDock: 'Contraer lista',
        expandDock: 'Expandir lista',
        sidebarGroup: 'Ramas de seguimiento',
        context: 'Contexto',
        contextStart: 'Inicio del contexto',
        waiting: 'Esperando pregunta',
        treeNote: 'Contexto actual del modelo: {context}. Las ramas hermanas no están incluidas.',
        anchorMissing: 'El texto original de #{n} no está visible; puede estar plegado o no haberse cargado',
        draftWait: 'Pregunta en la ventana de entrada de abajo',
      },      fr: {
        chip: 'Demander',
        chipHint: 'Posez une question sur le texte sélectionné dans une branche indépendante',
        branch: 'Branche',
        branchN: 'Branche',
        basedOn: 'basé sur',
        main: 'Conversation principale',
        independent: 'Branche indépendante',
        draft: 'Brouillon',
        sending: 'Création',
        running: 'En cours',
        ready: 'Créé',
        failed: 'Échec',
        send: 'Envoyer',
        sendingAction: 'Envoi…',
        quote: 'Cité',
        defaultQuestion: 'Explique ce passage plus en détail.',
        empty: 'Ajoutez votre question…',
        sendHint: 'Entrée pour envoyer · Maj + Entrée pour un saut de ligne',
        collapse: 'Réduire',
        input: 'Saisie',
        deleteDraft: 'Supprimer le brouillon',
        close: 'Fermer',
        expand: 'Agrandir',
        restore: 'Restaurer le panneau',
        back: 'Retour',
        forward: 'Suivant',
        stageHint: 'Retour / Suivant change uniquement la branche affichée ; cela ne modifie pas le contexte du modèle.',
        path: 'Chemin',
        all: 'Tout',
        tree: 'Arbre des branches',
        current: 'Actuel',
        dock: 'Branches réduites',
        open: 'Ouvrir',
        retry: 'Réessayer',
        error: 'Échec de l\'envoi',
        forkError: 'Impossible de créer la branche',
        noSession: 'Session indisponible',
        tooLong: 'La sélection est trop longue',
        content: 'Texte',
        quoteLabel: 'Cité de',
        showQuote: 'Afficher la citation',
        hideQuote: 'Masquer la citation',
        switchBranch: 'Passer à cette branche',
        stages: 'nœuds',
        collapseDock: 'Réduire la liste',
        expandDock: 'Développer la liste',
        sidebarGroup: 'Branches de suivi',
        context: 'Contexte',
        contextStart: 'Racine du contexte',
        waiting: 'En attente de question',
        treeNote: 'Contexte actuel du modèle : {context}. Les branches sœurs ne sont pas incluses.',
        anchorMissing: 'Le texte source de #{n} n\'est pas visible ; il est peut-être replié ou pas encore chargé',
        draftWait: 'Posez votre question dans la fenêtre de saisie ci-dessous',
      },      de: {
        chip: 'Fragen',
        chipHint: 'Frage zum ausgewählten Text in einem unabhängigen Zweig stellen',
        branch: 'Zweig',
        branchN: 'Zweig',
        basedOn: 'basierend auf',
        main: 'Hauptchat',
        independent: 'Unabhängiger Zweig',
        draft: 'Entwurf',
        sending: 'Wird erstellt',
        running: 'Läuft',
        ready: 'Erstellt',
        failed: 'Fehlgeschlagen',
        send: 'Senden',
        sendingAction: 'Wird gesendet…',
        quote: 'Zitiert',
        defaultQuestion: 'Erkläre diesen Inhalt genauer.',
        empty: 'Frage hier ergänzen…',
        sendHint: 'Enter zum Senden · Umschalt + Enter für neue Zeile',
        collapse: 'Einklappen',
        input: 'Eingabe',
        deleteDraft: 'Entwurf löschen',
        close: 'Schließen',
        expand: 'Vergrößern',
        restore: 'Panel wiederherstellen',
        back: 'Zurück',
        forward: 'Weiter',
        stageHint: 'Zurück / Weiter wechselt nur den angezeigten Zweig; der Modellkontext bleibt unverändert.',
        path: 'Pfad',
        all: 'Alle',
        tree: 'Zweigbaum',
        current: 'Aktuell',
        dock: 'Eingeklappte Zweige',
        open: 'Öffnen',
        retry: 'Erneut versuchen',
        error: 'Senden fehlgeschlagen',
        forkError: 'Zweig konnte nicht erstellt werden',
        noSession: 'Sitzung nicht verfügbar',
        tooLong: 'Auswahl ist zu lang',
        content: 'Text',
        quoteLabel: 'Zitiert aus',
        showQuote: 'Zitat anzeigen',
        hideQuote: 'Zitat ausblenden',
        switchBranch: 'Zu diesem Zweig wechseln',
        stages: 'Knoten',
        collapseDock: 'Liste einklappen',
        expandDock: 'Liste ausklappen',
        sidebarGroup: 'Folgezweige',
        context: 'Kontext',
        contextStart: 'Kontextwurzel',
        waiting: 'Warte auf Frage',
        treeNote: 'Aktueller Modellkontext: {context}. Geschwisterzweige sind nicht enthalten.',
        anchorMissing: 'Der Quelltext von #{n} ist nicht sichtbar; er ist möglicherweise eingeklappt oder noch nicht geladen',
        draftWait: 'Stelle deine Frage im Eingabefenster unten',
      },      ru: {
        chip: 'Спросить',
        chipHint: 'Задать вопрос по выделенному тексту в отдельной ветке',
        branch: 'Ветка',
        branchN: 'Ветка',
        basedOn: 'на основе',
        main: 'Основной чат',
        independent: 'Независимая ветка',
        draft: 'Черновик',
        sending: 'Создание',
        running: 'Выполняется',
        ready: 'Создано',
        failed: 'Ошибка',
        send: 'Отправить',
        sendingAction: 'Отправка…',
        quote: 'Цитата',
        defaultQuestion: 'Объясните этот фрагмент подробнее.',
        empty: 'Добавьте вопрос…',
        sendHint: 'Enter — отправить · Shift + Enter — новая строка',
        collapse: 'Свернуть',
        input: 'Ввод',
        deleteDraft: 'Удалить черновик',
        close: 'Закрыть',
        expand: 'Развернуть',
        restore: 'Вернуть панель',
        back: 'Назад',
        forward: 'Вперёд',
        stageHint: 'Назад / Вперёд переключает только просматриваемую ветку; контекст модели не меняется.',
        path: 'Путь',
        all: 'Все',
        tree: 'Дерево веток',
        current: 'Текущая',
        dock: 'Свёрнутые ветки',
        open: 'Открыть',
        retry: 'Повторить',
        error: 'Не удалось отправить',
        forkError: 'Не удалось создать ветку',
        noSession: 'Сеанс недоступен',
        tooLong: 'Выделение слишком длинное',
        content: 'Текст',
        quoteLabel: 'Цитата из',
        showQuote: 'Показать цитату',
        hideQuote: 'Скрыть цитату',
        switchBranch: 'Перейти к этой ветке',
        stages: 'узлов',
        collapseDock: 'Свернуть список',
        expandDock: 'Развернуть список',
        sidebarGroup: 'Ветки вопросов',
        context: 'Контекст',
        contextStart: 'Начало контекста',
        waiting: 'Ожидание вопроса',
        treeNote: 'Текущий контекст модели: {context}. Ветки-сестры не включены.',
        anchorMissing: 'Исходный текст #{n} не отображается; возможно, он свёрнут или ещё не загружен',
        draftWait: 'Задайте вопрос в окне ввода ниже',
      },      pt: {
        chip: 'Perguntar',
        chipHint: 'Pergunte sobre o texto selecionado em um ramo independente',
        branch: 'Ramo',
        branchN: 'Ramo',
        basedOn: 'com base em',
        main: 'Conversa principal',
        independent: 'Ramo independente',
        draft: 'Rascunho',
        sending: 'Criando',
        running: 'Em execução',
        ready: 'Criado',
        failed: 'Falhou',
        send: 'Enviar',
        sendingAction: 'Enviando…',
        quote: 'Citado',
        defaultQuestion: 'Explique este conteúdo com mais detalhes.',
        empty: 'Adicione sua pergunta…',
        sendHint: 'Enter para enviar · Shift + Enter para nova linha',
        collapse: 'Recolher',
        input: 'Entrada',
        deleteDraft: 'Excluir rascunho',
        close: 'Fechar',
        expand: 'Ampliar',
        restore: 'Restaurar painel',
        back: 'Voltar',
        forward: 'Avançar',
        stageHint: 'Voltar / Avançar apenas altera o ramo exibido; não altera o contexto do modelo.',
        path: 'Caminho',
        all: 'Tudo',
        tree: 'Árvore de ramos',
        current: 'Atual',
        dock: 'Ramos recolhidos',
        open: 'Abrir',
        retry: 'Tentar novamente',
        error: 'Falha ao enviar',
        forkError: 'Não foi possível criar o ramo',
        noSession: 'Sessão indisponível',
        tooLong: 'A seleção é muito longa',
        content: 'Texto',
        quoteLabel: 'Citado de',
        showQuote: 'Mostrar citação',
        hideQuote: 'Ocultar citação',
        switchBranch: 'Mudar para este ramo',
        stages: 'nós',
        collapseDock: 'Recolher lista',
        expandDock: 'Expandir lista',
        sidebarGroup: 'Ramos de acompanhamento',
        context: 'Contexto',
        contextStart: 'Raiz do contexto',
        waiting: 'Aguardando pergunta',
        treeNote: 'Contexto atual do modelo: {context}. Os ramos irmãos não estão incluídos.',
        anchorMissing: 'O texto original de #{n} não está visível; pode estar recolhido ou ainda não carregado',
        draftWait: 'Faça sua pergunta na janela de entrada abaixo',
      },    }

    let app = null

    // ---------------------------------------------------------------------
    // small helpers
    // ---------------------------------------------------------------------

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value))
    }

    function defaultInputBox(panel) {
      const width = Math.min(panel.w || 440, Math.max(240, window.innerWidth - 24))
      const height = 168
      let x = clamp(panel.x, 8, Math.max(8, window.innerWidth - width - 8))
      let y = panel.y + (panel.h || 360) + 8
      if (y + height > window.innerHeight - 8) y = panel.y - height - 8
      if (y < 8) y = Math.max(8, window.innerHeight - height - 8)
      return { x, y, w: width, h: height }
    }

    function snippet(text, length) {
      const value = String(text || '').replace(/\s+/g, ' ').trim()
      return value.length > length ? `${value.slice(0, length - 1)}…` : value
    }

    function cssEscape(value) {
      return String(value).replace(/["\\]/g, '\\$&')
    }

    function isEditable(element) {
      if (element === null || element === undefined) return false
      if (!(element instanceof Element)) return false
      return element.matches('input, textarea, select, [contenteditable="true"], [contenteditable=""]')
    }

    function textNodesOf(root) {
      const nodes = []
      if (!root) return nodes
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (node.nodeValue === null || node.nodeValue.length === 0) return NodeFilter.FILTER_REJECT
          const parent = node.parentElement
          if (parent && parent.closest('script, style, [hidden], [aria-hidden="true"]')) return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        },
      })
      let current = walker.nextNode()
      while (current) {
        nodes.push(current)
        current = walker.nextNode()
      }
      return nodes
    }

    function sourceText(root) {
      return textNodesOf(root).map(node => node.nodeValue).join('')
    }

    function rangeFromOffsets(root, start, end) {
      const nodes = textNodesOf(root)
      let position = 0
      let startNode = null
      let startOffset = 0
      let endNode = null
      let endOffset = 0
      for (const node of nodes) {
        const length = node.nodeValue.length
        const next = position + length
        if (startNode === null && start >= position && start <= next) {
          startNode = node
          startOffset = clamp(start - position, 0, length)
        }
        if (endNode === null && end >= position && end <= next) {
          endNode = node
          endOffset = clamp(end - position, 0, length)
        }
        position = next
      }
      if (startNode === null || endNode === null) return null
      const range = document.createRange()
      try {
        range.setStart(startNode, startOffset)
        range.setEnd(endNode, endOffset)
        return range
      } catch (_error) {
        return null
      }
    }

    function offsetAt(root, container, offset) {
      if (!root.contains(container)) return null
      try {
        const range = document.createRange()
        range.selectNodeContents(root)
        range.setEnd(container, offset)
        return range.toString().length
      } catch (_error) {
        return null
      }
    }

    function sourceIndexInNode(node, source) {
      const all = node.querySelectorAll('[data-text-interaction-source]')
      for (let i = 0; i < all.length; i += 1) {
        if (all[i] === source) return i
      }
      return 0
    }

    function seqOfChatNode(node) {
      if (!node) return -1
      const finalSeq = node.data && node.data.finalNode && node.data.finalNode.seq
      if (typeof finalSeq === 'number') return finalSeq
      return typeof node.anchorSeq === 'number' ? node.anchorSeq : -1
    }

    function hideInheritedRows(host, sessionId, cutSeq) {
      if (!host || !app || !Number.isFinite(cutSeq)) return
      const chat = app.chats.get(sessionId)
      if (!chat || !chat.nodes) return
      const rows = host.querySelectorAll('[data-chat-node-key]')
      for (const row of rows) {
        const key = row.getAttribute('data-chat-node-key')
        if (!key) continue
        const node = chat.nodes.get(key)
        const seq = seqOfChatNode(node)
        if (seq >= 0 && seq <= cutSeq && row.style.display !== 'none') row.style.display = 'none'
      }
      const wrappers = host.querySelectorAll('[data-chat-anchor-key]')
      for (const wrapper of wrappers) {
        const inner = wrapper.querySelectorAll('[data-chat-node-key]')
        if (inner.length === 0) continue
        let visible = false
        for (const row of inner) {
          if (row.style.display !== 'none') { visible = true; break }
        }
        if (visible) {
          if (wrapper.dataset.ifuHidden === '1') {
            wrapper.style.display = wrapper.dataset.ifuPrevDisplay || ''
            delete wrapper.dataset.ifuHidden
            delete wrapper.dataset.ifuPrevDisplay
          }
        } else if (wrapper.dataset.ifuHidden !== '1') {
          wrapper.dataset.ifuPrevDisplay = wrapper.style.display
          wrapper.style.display = 'none'
          wrapper.dataset.ifuHidden = '1'
        }
      }
    }

    function mainChatFlow(anchor) {
      const flows = Array.from(document.querySelectorAll('[data-chat-flow]'))
        .filter(flow => !flow.closest('[data-ifu-root]'))
      let candidates = flows
      if (anchor && anchor.nodeKey) {
        const selector = `[data-chat-node-key="${cssEscape(anchor.nodeKey)}"]`
        const containing = flows.filter(flow => flow.querySelector(selector))
        if (containing.length > 0) candidates = containing
      }
      const visible = candidates.find((flow) => {
        const rect = flow.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      })
      return visible || candidates[0] || null
    }

    function branchChatFlow(sessionId) {
      if (!sessionId) return null
      const selector = `[data-ifu-session="${cssEscape(sessionId)}"] [data-chat-flow]`
      return document.querySelector(selector)
    }

    function treeOrder(state, branches) {
      const ids = new Set(branches.map(branch => branch.id))
      const byParent = new Map()
      for (const branch of branches) {
        const parentId = branch.parentBranchId && ids.has(branch.parentBranchId)
          ? branch.parentBranchId
          : null
        const list = byParent.get(parentId) || []
        list.push(branch)
        byParent.set(parentId, list)
      }
      const rows = []
      const seen = new Set()
      const walk = (parentId, depth) => {
        for (const branch of byParent.get(parentId) || []) {
          if (seen.has(branch.id)) continue
          seen.add(branch.id)
          rows.push({ branch, depth })
          walk(branch.id, depth + 1)
        }
      }
      walk(null, 0)
      for (const branch of branches) {
        if (!seen.has(branch.id)) rows.push({ branch, depth: 0 })
      }
      return rows
    }

    function pathOf(state, branch) {
      const parts = []
      let current = branch
      const seen = new Set()
      while (current && !seen.has(current.id)) {
        seen.add(current.id)
        parts.unshift(current)
        current = current.parentBranchId ? state.branches[current.parentBranchId] : null
      }
      return parts
    }

    function pathLabel(state, branch) {
      return `${app.t('main')}${pathOf(state, branch).map(item => ` › #${item.number}`).join('')}`
    }

    function branchBasis(state, branch) {
      if (!branch.parentBranchId) return `${app.t('basedOn')} ${app.t('main')}`
      const parent = state.branches[branch.parentBranchId]
      return parent ? `${app.t('basedOn')} #${parent.number}` : `${app.t('basedOn')} ${app.t('main')}`
    }

    function statusLabel(branch) {
      if (branch.status === 'sending') return app.t('sending')
      if (branch.status === 'running') return app.t('running')
      if (branch.status === 'error') return app.t('failed')
      if (branch.prompted) return app.t('ready')
      return app.t('draft')
    }

    function colorVars(color) {
      const index = Number.isFinite(color) ? color % COLORS.length : 0
      return {
        '--ifu-c': `var(--ifu-c${index})`,
        '--ifu-t': `var(--ifu-t${index})`,
        '--ifu-h': `var(--ifu-h${index})`,
      }
    }

    function trackPointer(event, onMove, onEnd) {
      if (!event || event.button !== 0) return
      event.preventDefault()
      const startX = event.clientX
      const startY = event.clientY
      const move = (moveEvent) => onMove(moveEvent.clientX - startX, moveEvent.clientY - startY)
      const finish = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', finish)
        window.removeEventListener('pointercancel', finish)
        if (onEnd) onEnd()
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', finish, { once: true })
      window.addEventListener('pointercancel', finish, { once: true })
    }

    // ---------------------------------------------------------------------
    // app store
    // ---------------------------------------------------------------------

    function createApp(ctx) {
      const state = {
        version: 0,
        mainSessionId: null,
        branches: {},
        order: [],
        nextNumber: 1,
        chip: null,
        stageOpen: false,
        stageStack: [],
        stageIndex: -1,
        sidebarCollapsedRoots: {},
        notice: null,
        dockOpen: true,
        dock: null,
        treeOpen: false,
      }
      const refs = new Map()
      const chats = new Map()
      const listeners = new Set()
      let main = { sessionId: null, nodes: null, timeline: null }
      let persistTimer = null
      let projectFrame = null
      let noticeTimer = null
      let selectionTimer = null
      let mutationObserver = null
      let installed = false

      const app = {
        state,
        refs,
        chats,
        get main() { return main },
        t(key, params) {
          if (ctx.locale) {
            const value = ctx.locale.bind(NS)(key, params)
            if (value && value !== key) return value
          }
          const template = DICT.en[key] ?? key
          if (!params) return template
          return template.replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match)
        },
        subscribe(listener) {
          listeners.add(listener)
          return () => { listeners.delete(listener) }
        },
        getVersion() { return state.version },
        emit,
        load,
        persist,
        install,
        setMainChat,
        setBranchChat,
        setBranchRunning,
        scheduleProject,
        projectHighlights,
        highlightRects,
        markItems,
        openDraft,
        send,
        setDraftText,
        setInputText,
        sendFollowup,
        openPanel,
        revealBranch,
        collapse,
        deleteDraft,
        promote,
        stageGo,
        stageRestore,
        stageClose,
        closeDock,
        toggleDock,
        toggleTree,
        toggleSidebarBranches,
        startPanelDrag,
        startPanelResize,
        startDockDrag,
        startDockResize,
        notify,
        clearChip,
        branchBySession,
      }

      function emit() {
        state.version += 1
        for (const listener of listeners) {
          try { listener() } catch (_error) { /* one bad listener must not stop others */ }
        }
        schedulePersist()
      }

      function notify(text) {
        state.notice = text
        emit()
        if (noticeTimer !== null) clearTimeout(noticeTimer)
        noticeTimer = setTimeout(() => {
          state.notice = null
          emit()
        }, 4200)
      }

      function schedulePersist() {
        if (persistTimer !== null) return
        persistTimer = setTimeout(() => {
          persistTimer = null
          persist()
        }, 250)
      }

      function persist() {
        try {
          const branches = {}
          for (const [id, branch] of Object.entries(state.branches)) {
            branches[id] = {
              id: branch.id,
              number: branch.number,
              color: branch.color,
              rootSessionId: branch.rootSessionId,
              parentSessionId: branch.parentSessionId,
              parentBranchId: branch.parentBranchId,
              sessionId: branch.sessionId,
              anchor: branch.anchor,
              question: branch.question,
              prompted: branch.prompted,
              status: branch.status === 'running' ? 'idle' : branch.status,
              error: branch.error,
              panel: branch.panel,
              input: branch.input,
              inputText: branch.inputText,
              createdAt: branch.createdAt,
            }
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: 1,
            branches,
            order: state.order,
            nextNumber: state.nextNumber,
            dock: state.dock,
            sidebarCollapsedRoots: state.sidebarCollapsedRoots,
          }))
        } catch (_error) {
          // localStorage may be unavailable; the session logs still exist.
        }
      }

      function load() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (!raw) return
          const data = JSON.parse(raw)
          if (!data || data.version !== 1 || !data.branches || !Array.isArray(data.order)) return
          let maxNumber = 0
          for (const id of data.order) {
            const branch = data.branches[id]
            if (!branch || !branch.id || !branch.anchor || !branch.anchor.sessionId) continue
            if (!Array.isArray(branch.anchor.ranges) || branch.anchor.ranges.length === 0) continue
            branch.mode = 'collapsed'
            branch.loading = false
            branch.status = branch.status === 'sending' ? 'error' : branch.status
            branch.panel = { x: Number(branch.panel?.x) || 24, y: Number(branch.panel?.y) || 80, w: Number(branch.panel?.w) || 440, h: Number(branch.panel?.h) || 360 }
            if (!branch.prompted && !branch.input && branch.panel.h > 520) branch.panel.h = 360
            branch.input = {
              x: Number(branch.input?.x) || defaultInputBox(branch.panel).x,
              y: Number(branch.input?.y) || defaultInputBox(branch.panel).y,
              w: Number(branch.input?.w) || 440,
              h: Number(branch.input?.h) || 168,
            }
            branch.inputText = String(branch.inputText || '')
            state.branches[id] = branch
            state.order.push(id)
            maxNumber = Math.max(maxNumber, Number(branch.number) || 0)
          }
          state.nextNumber = Math.max(Number(data.nextNumber) || 1, maxNumber + 1)
          if (data.dock && Number.isFinite(data.dock.x) && Number.isFinite(data.dock.y)) state.dock = { x: data.dock.x, y: data.dock.y, w: Number(data.dock.w) || 286, h: Number(data.dock.h) || 260 }
          state.sidebarCollapsedRoots = data.sidebarCollapsedRoots && typeof data.sidebarCollapsedRoots === 'object'
            ? { ...data.sidebarCollapsedRoots }
            : {}
        } catch (_error) {
          // Ignore a corrupt or incompatible tree; sessions remain available.
        }
      }

      function branchBySession(sessionId) {
        for (const id of state.order) {
          const branch = state.branches[id]
          if (branch.sessionId === sessionId) return branch
        }
        return null
      }

      function setMainChat(sessionId, nodes, timeline) {
        if (!sessionId) return
        const changed = state.mainSessionId !== sessionId
        main = { sessionId, nodes, timeline }
        if (!changed) {
          scheduleProject()
          return
        }
        state.mainSessionId = sessionId
        state.chip = null
        state.stageOpen = false
        state.stageStack = []
        state.stageIndex = -1
        state.treeOpen = false
        for (const branch of Object.values(state.branches)) {
          if (branch.mode === 'panel' || branch.mode === 'stage') branch.mode = 'collapsed'
        }
        emit()
      }

      function setBranchChat(sessionId, nodes, timeline) {
        if (!sessionId) return
        chats.set(sessionId, { nodes, timeline })
        scheduleProject()
      }

      function setBranchRunning(branchId, running) {
        const branch = state.branches[branchId]
        if (!branch) return
        const next = running ? 'running' : (branch.prompted ? 'idle' : (branch.status === 'error' ? 'error' : 'draft'))
        if (branch.status !== next) {
          branch.status = next
          emit()
        }
      }

      function scheduleProject() {
        if (projectFrame !== null) return
        projectFrame = requestAnimationFrame(() => {
          projectFrame = null
          projectHighlights()
          renderBadges()
          renderSidebarBranches()
        })
      }

      function projectHighlights() {
        if (typeof CSS === 'undefined' || !CSS.highlights || typeof Highlight === 'undefined') return
        for (let i = 0; i < COLORS.length; i += 1) CSS.highlights.delete(`ifu-c${i}`)
        if (!state.mainSessionId) return
        const groups = Array.from({ length: COLORS.length }, () => [])
        for (const id of state.order) {
          const branch = state.branches[id]
          if (!branch || branch.rootSessionId !== state.mainSessionId) continue
          if (!branch.anchor.ranges || branch.anchor.ranges.length === 0) continue
          const inThread = branch.anchor.sessionId !== state.mainSessionId
          const root = inThread
            ? branchChatFlow(branch.anchor.sessionId)
            : mainChatFlow(branch.anchor.ranges[0])
          if (!root) continue
          for (const anchor of branch.anchor.ranges) {
            const range = restoreAnchorRange(root, anchor)
            if (range) groups[branch.color % COLORS.length].push(range)
          }
        }
        for (let i = 0; i < groups.length; i += 1) {
          if (groups[i].length > 0) CSS.highlights.set(`ifu-c${i}`, new Highlight(...groups[i]))
        }
      }

      function decorationLayerFor(column) {
        let layer = column.querySelector(':scope > [data-ifu-badge-layer]')
        if (layer) return layer
        layer = document.createElement('div')
        layer.className = 'ifu-badge-layer'
        layer.setAttribute('data-ifu-badge-layer', '')
        layer.setAttribute('aria-hidden', 'true')
        layer.addEventListener('click', (event) => {
          const target = event.target instanceof Element ? event.target.closest('[data-ifu-branch-id]') : null
          if (!target) return
          event.preventDefault()
          event.stopPropagation()
          openPanel(target.getAttribute('data-ifu-branch-id'))
        })
        column.appendChild(layer)
        return layer
      }

      function renderBadges() {
        if (!state.mainSessionId || state.stageOpen) {
          for (const layer of document.querySelectorAll('[data-ifu-badge-layer]')) layer.remove()
          return
        }
        const active = []
        let column = null
        for (const id of state.order) {
          const branch = state.branches[id]
          if (!branch || branch.rootSessionId !== state.mainSessionId) continue
          if (branch.anchor.sessionId !== state.mainSessionId) continue
          if (!branch.anchor.ranges || branch.anchor.ranges.length === 0) continue
          const flow = mainChatFlow(branch.anchor.ranges[0])
          if (!flow) continue
          column = flow
          const range = restoreAnchorRange(flow, branch.anchor.ranges[0])
          if (!range) continue
          const rect = range.getBoundingClientRect()
          if (rect.width < 1 || rect.height < 1) continue
          active.push({ branch, flow, rect })
        }
        if (!column || active.length === 0) {
          for (const layer of document.querySelectorAll('[data-ifu-badge-layer]')) layer.remove()
          return
        }
        const layer = decorationLayerFor(column)
        const columnRect = column.getBoundingClientRect()
        const fragment = document.createDocumentFragment()
        for (const item of active) {
          const button = document.createElement('button')
          button.type = 'button'
          button.className = 'ifu-badge'
          button.setAttribute('data-ifu-branch-id', item.branch.id)
          button.setAttribute('title', `#${item.branch.number} ${snippet(item.branch.anchor.quote, 48)}`)
          button.style.left = `${Math.round(item.rect.right - columnRect.left + 5)}px`
          button.style.top = `${Math.round(item.rect.top - columnRect.top - 2)}px`
          button.style.setProperty('--ifu-c', `var(--ifu-c${item.branch.color % COLORS.length})`)
          const dot = document.createElement('span')
          dot.className = 'ifu-dot'
          const label = document.createElement('span')
          label.textContent = `#${item.branch.number}`
          button.append(dot, label)
          fragment.appendChild(button)
        }
        layer.replaceChildren(fragment)
      }

      function highlightRects(thread) {
        if (!state.mainSessionId) return []
        const output = []
        for (const id of state.order) {
          const branch = state.branches[id]
          if (!branch || branch.rootSessionId !== state.mainSessionId) continue
          if (!branch.anchor.ranges || branch.anchor.ranges.length === 0) continue
          const inThread = branch.anchor.sessionId !== state.mainSessionId
          if (Boolean(thread) !== inThread) continue
          const root = inThread
            ? branchChatFlow(branch.anchor.sessionId)
            : mainChatFlow(branch.anchor.ranges[0])
          if (!root) continue
          const scroller = root.closest('[data-conversation-scroll]') || root.closest('[data-ifu-session]') || root
          const clip = scroller.getBoundingClientRect()
          const clipRight = state.stageOpen && state.treeOpen
            ? Math.min(clip.right, window.innerWidth - 300)
            : clip.right
          let rangeIndex = 0
          for (const anchor of branch.anchor.ranges) {
            const range = restoreAnchorRange(root, anchor)
            if (!range) { rangeIndex += 1; continue }
            let rectIndex = 0
            for (const rect of range.getClientRects()) {
              const left = Math.max(rect.left, clip.left)
              const right = Math.min(rect.right, clipRight)
              const top = Math.max(rect.top, clip.top)
              const bottom = Math.min(rect.bottom, clip.bottom)
              if (right - left < 1 || bottom - top < 1) { rectIndex += 1; continue }
              output.push({
                id: `${branch.id}-${rangeIndex}-${rectIndex}`,
                color: branch.color,
                x: left,
                y: top,
                w: right - left,
                h: bottom - top,
              })
              rectIndex += 1
              if (output.length > 260) return output
            }
            rangeIndex += 1
          }
        }
        return output
      }

      function markItems() {
        if (!state.mainSessionId || state.stageOpen) return []
        const items = []
        for (const id of state.order) {
          const branch = state.branches[id]
          if (!branch || branch.rootSessionId !== state.mainSessionId) continue
          if (branch.anchor.sessionId !== state.mainSessionId) continue
          if (!branch.anchor.ranges || branch.anchor.ranges.length === 0) continue
          const root = mainChatFlow(branch.anchor.ranges[0])
          if (!root) continue
          const range = restoreAnchorRange(root, branch.anchor.ranges[0])
          if (!range) continue
          const rect = range.getBoundingClientRect()
          if (rect.width < 1 || rect.height < 1) continue
          const scroller = root.closest('[data-conversation-scroll]') || root
          const clip = scroller.getBoundingClientRect()
          if (rect.bottom < clip.top || rect.top > clip.bottom) continue
          const composerSeat = scroller.querySelector('[data-composer-seat]')
          const composerTop = composerSeat ? composerSeat.getBoundingClientRect().top : clip.bottom
          const visibleBottom = Math.min(clip.bottom, composerTop)
          const badgeY = Math.round(rect.top - 2)
          // Do not paint a marker over the composer: the visible chat area ends at its top edge.
          if (badgeY + 20 > visibleBottom || badgeY < clip.top) continue
          items.push({
            id: branch.id,
            number: branch.number,
            color: branch.color,
            x: clamp(Math.round(rect.right + 5), 8, window.innerWidth - 38),
            y: badgeY,
            quote: branch.anchor.quote,
          })
        }
        return items
      }

      function restoreAnchorRange(root, anchor) {
        const trySource = (source) => {
          const text = sourceText(source)
          let start = anchor.start
          let end = anchor.end
          if (start < 0 || end > text.length || start >= end || text.slice(start, end) !== anchor.quote) {
            const index = anchor.quote ? text.indexOf(anchor.quote) : -1
            if (index < 0) return null
            start = index
            end = index + anchor.quote.length
          }
          return rangeFromOffsets(source, start, end)
        }
        const node = root.querySelector(`[data-chat-node-key="${cssEscape(anchor.nodeKey)}"]`)
        if (node) {
          const sources = node.querySelectorAll('[data-text-interaction-source]')
          const source = sources[anchor.sourceIndex] || sources[0]
          if (source) {
            const range = trySource(source)
            if (range) return range
          }
        }
        if (anchor.quote) {
          for (const source of root.querySelectorAll('[data-text-interaction-source]')) {
            const range = trySource(source)
            if (range) return range
          }
        }
        return null
      }

      // -------------------------------------------------------------------
      // selection -> chip -> draft
      // -------------------------------------------------------------------

      function clearChip() {
        if (state.chip !== null) {
          state.chip = null
          emit()
        }
      }

      function suggestSelection() {
        if (!installed) return
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          clearChip()
          return
        }
        const range = selection.getRangeAt(0)
        const startElement = range.startContainer.nodeType === Node.ELEMENT_NODE
          ? range.startContainer
          : range.startContainer.parentElement
        const endElement = range.endContainer.nodeType === Node.ELEMENT_NODE
          ? range.endContainer
          : range.endContainer.parentElement
        if (!startElement || !endElement) { clearChip(); return }
        if (startElement.closest('[data-ifu-no-select], .ifu-compose, .ifu-stage-bar, .ifu-dock, .ifu-chip')) {
          clearChip()
          return
        }
        const startNode = startElement.closest('[data-chat-node-key]')
        const endNode = endElement.closest('[data-chat-node-key]')
        if (!startNode || !endNode || startNode !== endNode) {
          clearChip()
          return
        }
        if (startNode.getAttribute('data-chat-flow-kind') !== 'assistant-step') {
          clearChip()
          return
        }
        const flow = startNode.closest('[data-chat-flow]')
        if (!flow) { clearChip(); return }
        const holder = flow.closest('[data-ifu-session]')
        const sessionId = holder ? holder.getAttribute('data-ifu-session') : state.mainSessionId
        if (!sessionId) { clearChip(); return }
        const chat = sessionId === main.sessionId ? main : chats.get(sessionId)
        if (!chat || !chat.nodes) { clearChip(); return }
        const nodeKey = startNode.getAttribute('data-chat-node-key')
        const chatNode = chat.nodes.get(nodeKey)
        if (!chatNode || seqOfChatNode(chatNode) < 0) { clearChip(); return }
        const sourceElements = Array.from(startNode.querySelectorAll('[data-text-interaction-source]'))
        const ranges = []
        for (const source of sourceElements) {
          if (!range.intersectsNode(source)) continue
          let start = 0
          let end = sourceText(source).length
          if (source.contains(range.startContainer)) {
            const value = offsetAt(source, range.startContainer, range.startOffset)
            if (value !== null) start = value
          }
          if (source.contains(range.endContainer)) {
            const value = offsetAt(source, range.endContainer, range.endOffset)
            if (value !== null) end = value
          }
          if (end <= start) continue
          const part = rangeFromOffsets(source, start, end)
          if (!part) continue
          const quote = part.toString()
          if (quote.trim() === '') continue
          const full = sourceText(source)
          ranges.push({
            nodeKey,
            flowKind: 'assistant-step',
            sourceIndex: sourceIndexInNode(startNode, source),
            start,
            end,
            quote,
            prefix: full.slice(Math.max(0, start - 32), start),
            suffix: full.slice(end, end + 32),
          })
        }
        if (ranges.length === 0) { clearChip(); return }
        const quote = ranges.map(part => part.quote).join('\n').trim()
        if (!quote) { clearChip(); return }
        if (quote.length > MAX_QUOTE) {
          notify(app.t('tooLong'))
          clearChip()
          return
        }
        if (sessionId === state.mainSessionId && branchBySession(sessionId)) { clearChip(); return }
        const parentBranch = sessionId === state.mainSessionId ? null : branchBySession(sessionId)
        if (sessionId !== state.mainSessionId && !parentBranch) { clearChip(); return }
        const rootSessionId = parentBranch ? parentBranch.rootSessionId : state.mainSessionId
        if (!rootSessionId) { clearChip(); return }
        const atSeq = Math.max(...ranges.map(part => seqOfChatNode(chat.nodes.get(part.nodeKey))))
        if (!Number.isFinite(atSeq) || atSeq < 0 || !Number.isInteger(atSeq)) { clearChip(); return }
        // Text inherited from the parent branch is read-only context here.
        if (parentBranch && atSeq <= parentBranch.anchor.atSeq) { clearChip(); return }
        const rect = range.getBoundingClientRect()
        const anchor = {
          sessionId,
          atSeq,
          quote,
          ranges,
          parentBranchId: parentBranch ? parentBranch.id : null,
          parentSessionId: sessionId,
          rootSessionId,
        }
        const left = clamp(rect.right - 88, 8, window.innerWidth - 100)
        const top = rect.bottom + 8 + 28 > window.innerHeight - 8
          ? Math.max(8, rect.top - 36)
          : rect.bottom + 8
        state.chip = { x: left, y: top, anchor }
        emit()
      }

      function scheduleSelection() {
        if (selectionTimer !== null) clearTimeout(selectionTimer)
        selectionTimer = setTimeout(() => {
          selectionTimer = null
          if (document.activeElement && document.activeElement.matches('button, input, textarea, select, [contenteditable="true"]')) {
            clearChip()
            return
          }
          try { suggestSelection() } catch (_error) { clearChip() }
        }, 90)
      }

      function onPointerDown(event) {
        if (event.target instanceof Element && event.target.closest('[data-ifu-chip]')) return
        if (state.chip !== null) clearChip()
      }

      function onPointerUp(event) {
        if (event.button !== 0) return
        if (!(event.target instanceof Element)) return
        if (event.target.closest('[data-ifu-chip], button, input, textarea, select, [contenteditable="true"], [data-ifu-no-select]')) return
        scheduleSelection()
      }

      function onKeyUp(event) {
        if (event.key !== 'Shift' && event.shiftKey === false && !event.key.startsWith('Arrow')) return
        scheduleSelection()
      }

      function onSelectionChange() {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          clearChip()
          return
        }
        scheduleSelection()
      }

      function onScroll() {
        if (state.chip !== null) clearChip()
      }

      function onKeyDown(event) {
        if (event.key !== 'Escape') return
        if (state.chip !== null) {
          clearChip()
          return
        }
        if (state.stageOpen && !isEditable(document.activeElement)) {
          event.preventDefault()
          stageClose()
        }
      }

      function install() {
        if (installed) return () => {}
        installed = true
        const style = document.createElement('style')
        style.setAttribute('data-ifu-style', '')
        style.textContent = STYLES
        ;(document.head || document.body || document.documentElement).appendChild(style)
        document.addEventListener('pointerdown', onPointerDown, true)
        document.addEventListener('pointerup', onPointerUp, true)
        document.addEventListener('keyup', onKeyUp, true)
        document.addEventListener('selectionchange', onSelectionChange)
        document.addEventListener('keydown', onKeyDown, true)
        window.addEventListener('scroll', onScroll, true)
        const onResize = () => scheduleProject()
        window.addEventListener('resize', onResize)
        if (document.body) {
          mutationObserver = new MutationObserver((records) => {
            const own = records.every((record) => {
              const target = record.target instanceof Element ? record.target : record.target.parentElement
              return target !== null && target !== undefined
                && (target.closest('[data-ifu-badge-layer]') !== null
                  || target.closest('.ifu-hl') !== null
                  || target.closest('[data-ifu-sidebar-group]') !== null
                  || target.closest('[data-ifu-sidebar-section]') !== null)
            })
            if (!own) scheduleProject()
          })
          mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['aria-selected'],
          })
        }
        scheduleProject()
        return () => {
          installed = false
          document.removeEventListener('pointerdown', onPointerDown, true)
          document.removeEventListener('pointerup', onPointerUp, true)
          document.removeEventListener('keyup', onKeyUp, true)
          document.removeEventListener('selectionchange', onSelectionChange)
          document.removeEventListener('keydown', onKeyDown, true)
          window.removeEventListener('scroll', onScroll, true)
          window.removeEventListener('resize', onResize)
          if (mutationObserver) mutationObserver.disconnect()
          mutationObserver = null
          if (projectFrame !== null) cancelAnimationFrame(projectFrame)
          projectFrame = null
          if (persistTimer !== null) clearTimeout(persistTimer)
          persistTimer = null
          if (noticeTimer !== null) clearTimeout(noticeTimer)
          noticeTimer = null
          if (selectionTimer !== null) clearTimeout(selectionTimer)
          selectionTimer = null
          style.remove()
          for (const layer of document.querySelectorAll('[data-ifu-badge-layer]')) layer.remove()
          for (const header of document.querySelectorAll('[data-ifu-sidebar-group]')) header.remove()
          for (const section of document.querySelectorAll('[data-ifu-sidebar-section]')) {
            const parent = section.parentElement
            if (parent) {
              while (section.firstChild) parent.insertBefore(section.firstChild, section)
            }
            section.remove()
          }
          for (const row of document.querySelectorAll('.ifu-sidebar-hidden')) row.classList.remove('ifu-sidebar-hidden')
          for (const control of document.querySelectorAll('[data-ifu-overflow-hidden]')) control.removeAttribute('data-ifu-overflow-hidden')
          for (let i = 0; i < COLORS.length; i += 1) {
            if (typeof CSS !== 'undefined' && CSS.highlights) CSS.highlights.delete(`ifu-c${i}`)
          }
          for (const reference of refs.values()) {
            try { reference.release() } catch (_error) { /* already released */ }
          }
          refs.clear()
          persist()
        }
      }

      // -------------------------------------------------------------------
      // branch actions
      // -------------------------------------------------------------------

      function nextNumber() {
        const number = state.nextNumber
        state.nextNumber += 1
        return number
      }

      function openDraft(anchor, x, y) {
        const number = nextNumber()
        const id = `ifu-${number}-${Date.now()}`
        const branch = {
          id,
          number,
          color: (number - 1) % COLORS.length,
          rootSessionId: anchor.rootSessionId,
          parentSessionId: anchor.parentSessionId,
          parentBranchId: anchor.parentBranchId,
          sessionId: null,
          anchor,
          question: '',
          prompted: false,
          status: 'draft',
          error: null,
          mode: 'panel',
          loading: false,
          panel: {
            x: clamp(x + ((number - 1) % 3) * 18, 12, Math.max(12, window.innerWidth - 452)),
            y: clamp(y + ((number - 1) % 3) * 18, 12, Math.max(12, window.innerHeight - 580)),
            w: 440,
            h: 360,
          },
          createdAt: Date.now(),
        }
        branch.input = { x: branch.panel.x, y: branch.panel.y, w: 440, h: 168 }
        state.branches[id] = branch
        state.order.push(id)
        state.chip = null
        try { window.getSelection()?.removeAllRanges() } catch (_error) { /* selection may be gone */ }
        emit()
      }

      function serialize(quote, question) {
        const body = String(quote || '').trim().split(/\r?\n/).map(line => `> ${line}`).join('\n')
        const text = String(question || '').trim() || app.t('defaultQuestion')
        return `${body}\n\n${text}`
      }

      function forgetReference(branchId) {
        const reference = refs.get(branchId)
        if (!reference) return
        refs.delete(branchId)
        try { reference.release() } catch (_error) { /* already released */ }
      }

      function setDraftText(branchId, text) {
        const branch = state.branches[branchId]
        if (!branch || branch.prompted) return
        branch.question = String(text)
        schedulePersist()
      }

      function setInputText(branchId, text) {
        const branch = state.branches[branchId]
        if (!branch) return
        branch.inputText = String(text)
        if (!branch.prompted) branch.question = branch.inputText
        schedulePersist()
      }

      async function ensureReference(branch) {
        if (refs.has(branch.id)) return refs.get(branch.id)
        if (!branch.sessionId) return null
        const reference = ctx.sessions.retain(branch.sessionId, { source: 'inlineFollowup' })
        refs.set(branch.id, reference)
        await reference.ready
        return reference
      }

      async function send(branchId, question) {
        const branch = state.branches[branchId]
        if (!branch || branch.status === 'sending') return false
        branch.question = String(question || '')
        branch.status = 'sending'
        branch.error = null
        emit()
        try {
          if (!branch.sessionId) {
            const childId = await ctx.sessions.fork({
              sessionId: branch.parentSessionId,
              atSeq: branch.anchor.atSeq,
              increaseTitle: false,
            })
            branch.sessionId = childId
            const reference = ctx.sessions.retain(childId, { source: 'inlineFollowup' })
            refs.set(branch.id, reference)
            await reference.ready
            void reference.binding.session.rename(`↳ #${branch.number} ${snippet(branch.anchor.quote, 18)}`).catch(() => {})
          } else {
            await ensureReference(branch)
          }
          const reference = refs.get(branch.id)
          if (!reference) throw new Error(app.t('noSession'))
          const text = serialize(branch.anchor.quote, branch.question)
          const echo = reference.binding.session.beginSubmission({
            mode: 'queue',
            text,
            attachments: [],
          })
          const result = await reference.binding.session.prompt(
            [{ type: 'text', text }],
            'queue',
            undefined,
            echo.requestId,
          )
          if (!result.ok) {
            branch.status = 'error'
            branch.error = result.error?.message || app.t('error')
            emit()
            return false
          }
          branch.status = 'running'
          branch.prompted = true
          branch.mode = 'panel'
          if (branch.panel.h < 480) branch.panel.h = 560
          emit()
          return true
        } catch (error) {
          branch.status = 'error'
          branch.error = error instanceof Error ? error.message : String(error)
          forgetReference(branch.id)
          emit()
          return false
        }
      }

      async function sendFollowup(branchId, question) {
        const branch = state.branches[branchId]
        const text = String(question || '').trim()
        if (!branch || !branch.sessionId || !branch.prompted || !text || branch.status === 'sending') return false
        branch.status = 'sending'
        branch.error = null
        emit()
        try {
          await ensureReference(branch)
          const reference = refs.get(branch.id)
          if (!reference) throw new Error(app.t('noSession'))
          const echo = reference.binding.session.beginSubmission({
            mode: 'queue',
            text,
            attachments: [],
          })
          const result = await reference.binding.session.prompt(
            [{ type: 'text', text }],
            'queue',
            undefined,
            echo.requestId,
          )
          if (!result.ok) {
            branch.status = 'error'
            branch.error = result.error?.message || app.t('error')
            emit()
            return false
          }
          branch.status = 'running'
          emit()
          return true
        } catch (error) {
          branch.status = 'error'
          branch.error = error instanceof Error ? error.message : String(error)
          emit()
          return false
        }
      }

      function openPanel(branchId) {
        const branch = state.branches[branchId]
        if (!branch) return
        if (state.stageOpen) {
          const active = activeStageBranch()
          if (active && active.id === branch.id) return
        }
        branch.mode = 'panel'
        if (branch.sessionId && !refs.has(branch.id)) {
          branch.loading = true
          emit()
          ensureReference(branch)
            .then(() => { branch.loading = false; emit() })
            .catch((error) => {
              branch.loading = false
              branch.status = 'error'
              branch.error = error instanceof Error ? error.message : String(error)
              forgetReference(branch.id)
              emit()
            })
          return
        }
        emit()
      }

      function toggleSidebarBranches(rootSessionId) {
        if (!rootSessionId) return
        if (state.sidebarCollapsedRoots[rootSessionId]) delete state.sidebarCollapsedRoots[rootSessionId]
        else state.sidebarCollapsedRoots[rootSessionId] = true
        renderSidebarBranches()
        emit()
      }

      function renderSidebarBranches() {
        if (!installed) return
        // Remove any older native-row section left by a previous hot-reloaded
        // build. Current custom sections only hold cloned rows and a header.
        for (const section of document.querySelectorAll('[data-ifu-sidebar-section]')) {
          if (!section.querySelector('[data-row-key^="session:"]')) continue
          const parent = section.parentElement
          if (parent) {
            while (section.firstChild) parent.insertBefore(section.firstChild, section)
          }
          section.remove()
        }
        const groups = new Map()
        for (const id of state.order) {
          const branch = state.branches[id]
          if (!branch || !branch.sessionId || !branch.rootSessionId) continue
          let group = groups.get(branch.rootSessionId)
          if (!group) {
            group = { rootSessionId: branch.rootSessionId, branches: [] }
            groups.set(branch.rootSessionId, group)
          }
          group.branches.push(branch)
        }
        const compare = (a, b) => a === b ? 0
          : (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1
        const visibleRow = (sessionId) => Array.from(document.querySelectorAll(`[data-row-key="session:${cssEscape(sessionId)}"]`))
          .find(row => !row.closest('[data-ifu-root]') && row.getClientRects().length > 0) || null
        const rootGroups = []
        for (const group of groups.values()) {
          const rootRow = visibleRow(group.rootSessionId)
          if (!rootRow) continue
          rootGroups.push({ ...group, rootRow })
        }
        rootGroups.sort((a, b) => compare(a.rootRow, b.rootRow))
        const usedSections = new Set()
        const usedHeaders = new Set()
        const containers = new Set()
        for (const group of rootGroups) {
          const rootParent = group.rootRow.parentElement
          if (!rootParent) continue
          const siblingSessions = rootParent.querySelectorAll('[data-row-key^="session:"]').length
          const container = siblingSessions <= 1 && rootParent.parentElement
            ? rootParent.parentElement
            : rootParent
          let rootChild = group.rootRow
          while (rootChild && rootChild.parentElement !== container) rootChild = rootChild.parentElement
          if (!rootChild || !container || container === document.body) continue
          containers.add(container)
          const rootId = cssEscape(group.rootSessionId)
          // Keep exactly one section per root. React can briefly leave an old
          // section behind while it replaces a row wrapper; without this the
          // same branch list can render twice.
          const matchingSections = Array.from(document.querySelectorAll(`[data-ifu-sidebar-section][data-ifu-sidebar-section-root="${rootId}"]`))
          let section = matchingSections.find(candidate => candidate.parentElement === container) || matchingSections[0] || null
          for (const candidate of matchingSections) {
            if (candidate !== section) candidate.remove()
          }
          if (!section) {
            section = document.createElement('div')
            section.className = 'ifu-sidebar-section'
            section.setAttribute('data-ifu-sidebar-section', '')
            section.setAttribute('data-ifu-sidebar-section-root', group.rootSessionId)
            container.insertBefore(section, rootChild.nextSibling)
          } else if (section.parentElement !== container || section.previousSibling !== rootChild) {
            container.insertBefore(section, rootChild.nextSibling)
          }
          usedSections.add(section)
          let header = section.querySelector(':scope > [data-ifu-sidebar-group]')
          if (!header) {
            header = document.createElement('button')
            header.type = 'button'
            header.className = 'ifu-sidebar-group'
            header.setAttribute('data-ifu-sidebar-group', '')
            header.setAttribute('data-ifu-sidebar-root', group.rootSessionId)
            header.addEventListener('click', (event) => {
              event.preventDefault()
              event.stopPropagation()
              toggleSidebarBranches(header.getAttribute('data-ifu-sidebar-root'))
            })
          }
          const collapsed = Boolean(state.sidebarCollapsedRoots[group.rootSessionId])
          const branches = Array.from(new Map(group.branches.map(branch => [branch.id, branch])).values())
          const label = `${collapsed ? '▸' : '▾'} ${app.t('sidebarGroup')} · ${branches.length}`
          if (header.textContent !== label) header.textContent = label
          usedHeaders.add(header)
          const items = []
          for (const branch of branches) {
            // Use the same custom row for every branch. Earlier versions cloned
            // a rendered native row when one happened to be mounted, which made
            // some rows look native and some look custom in the same group.
            const item = document.createElement('div')
            item.className = 'ifu-sidebar-clone ifu-sidebar-clone-fallback'
            item.setAttribute('role', 'button')
            item.style.setProperty('--ifu-c', `var(--ifu-c${branch.color % COLORS.length})`)
            const dot = document.createElement('span')
            dot.className = 'ifu-dot'
            const num = document.createElement('span')
            num.className = 'ifu-sidebar-clone-num'
            num.textContent = `#${branch.number}`
            const title = document.createElement('span')
            title.className = 'ifu-sidebar-clone-title'
            title.textContent = branch.question || branch.anchor.quote
            const status = document.createElement('span')
            status.className = 'ifu-sidebar-clone-status'
            status.textContent = statusLabel(branch)
            item.append(dot, num, title, status)
            item.addEventListener('click', (event) => {
              event.preventDefault()
              event.stopPropagation()
              const reveal = () => app.revealBranch(branch.id)
              const rootRow = state.mainSessionId === group.rootSessionId ? null : visibleRow(group.rootSessionId)
              if (rootRow) {
                // A branch can belong to another main conversation. Open that
                // root first, then reveal the branch and scroll to its source.
                rootRow.click()
                setTimeout(reveal, 350)
              } else {
                reveal()
              }
            })
            item.classList.toggle('ifu-sidebar-hidden', collapsed)
            items.push(item)
          }
          section.replaceChildren(header, ...items)
        }
        for (const header of document.querySelectorAll('[data-ifu-sidebar-group]')) {
          if (!usedHeaders.has(header)) header.remove()
        }
        for (const section of document.querySelectorAll('[data-ifu-sidebar-section]')) {
          if (!usedSections.has(section)) section.remove()
        }
        const allBranchIds = new Set()
        for (const group of groups.values()) {
          for (const branch of group.branches) allBranchIds.add(branch.sessionId)
        }
        for (const id of allBranchIds) {
          for (const row of document.querySelectorAll(`[data-row-key="session:${cssEscape(id)}"]`)) {
            if (!row.closest('[data-ifu-root]')) row.classList.add('ifu-sidebar-hidden')
          }
        }
        for (const control of document.querySelectorAll('[data-row-key^="overflow:"]')) {
          const parent = control.parentElement
          if (parent && Array.from(usedSections).some(section => parent.contains(section))) {
            control.setAttribute('data-ifu-overflow-hidden', '')
          } else {
            control.removeAttribute('data-ifu-overflow-hidden')
          }
        }
      }

      function alignRowInScrollers(row) {
        if (!row || !row.isConnected) return
        let element = row.parentElement
        while (element && element !== document.documentElement) {
          const style = getComputedStyle(element)
          if (/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 2) {
            const rowRect = row.getBoundingClientRect()
            const box = element.getBoundingClientRect()
            if (rowRect.top < box.top + 8 || rowRect.bottom > box.bottom - 8) {
              const next = element.scrollTop + rowRect.top - box.top - (element.clientHeight - rowRect.height) / 2
              element.scrollTop = Math.max(0, Math.min(next, element.scrollHeight - element.clientHeight))
            }
          }
          element = element.parentElement
        }
      }

      function centerRangeInScrollers(range) {
        if (!range) return
        let element = range.startContainer.nodeType === Node.ELEMENT_NODE
          ? range.startContainer
          : range.startContainer.parentElement
        while (element && element !== document.documentElement) {
          const style = getComputedStyle(element)
          if (/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 2) {
            const rect = range.getBoundingClientRect()
            const box = element.getBoundingClientRect()
            if (rect.height > 0) {
              const next = element.scrollTop + rect.top - box.top - (element.clientHeight - rect.height) / 2
              element.scrollTop = Math.max(0, Math.min(next, element.scrollHeight - element.clientHeight))
            }
          }
          element = element.parentElement
        }
      }

      function scrollBranchIntoView(branch, attempt = 0) {
        const sessionId = branch.anchor.sessionId
        const first = branch.anchor.ranges && branch.anchor.ranges[0]
        const root = sessionId === state.mainSessionId
          ? mainChatFlow(first)
          : branchChatFlow(sessionId)
        const range = root && first ? restoreAnchorRange(root, first) : null
        const row = root && first?.nodeKey
          ? root.querySelector(`[data-chat-node-key="${cssEscape(first.nodeKey)}"]`)
          : null
        const chatNodes = sessionId === state.mainSessionId ? main.nodes : chats.get(sessionId)?.nodes
        const chatNode = chatNodes && first?.nodeKey ? chatNodes.get(first.nodeKey) : null
        const turn = chatNode?.location?.turn?.turn
        const content = root ? root.closest('[data-conversation-content]') : document.querySelector('[data-conversation-content]')
        const navigator = Number.isSafeInteger(turn) && content
          ? Array.from(content.querySelectorAll('button[data-index][aria-label]')).find((button) => {
              const label = button.getAttribute('aria-label') || ''
              return new RegExp(`(?:^|\\D)${turn}(?:\\D|$)`).test(label)
            }) || null
          : null
        if (!root || (!range && !row)) {
          // An off-screen historical Turn may not be mounted at all. The turn
          // rail is the ChatView's own loader/scroll entry, so use it before
          // giving up on this attempt.
          if (navigator && attempt === 0) navigator.click()
          if (attempt < 14) setTimeout(() => scrollBranchIntoView(branch, attempt + 1), 100)
          else notify(app.t('anchorMissing', { n: branch.number }))
          return
        }
        if (navigator && attempt === 0) navigator.click()
        const target = row || range.startContainer.parentElement?.closest('[data-chat-node-key]')
        if (target) {
          // scrollIntoView is deliberate here: DSH's ChatView owns a nested
          // scrollport and may still be in follow-tail mode. A raw scrollTop
          // write can be swallowed by that controller; scrollIntoView emits the
          // native scroll event that switches it to reader mode.
          target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' })
          alignRowInScrollers(target)
          try {
            const previous = document.activeElement
            target.setAttribute('tabindex', '-1')
            target.focus({ preventScroll: false })
            if (previous instanceof HTMLElement) setTimeout(() => previous.focus({ preventScroll: true }), 0)
          } catch (_error) { /* row focus is only a scrolling assist */ }
        }
        if (range) {
          centerRangeInScrollers(range)
          const scroller = root.closest('[data-conversation-scroll]') || root
          const rect = range.getBoundingClientRect()
          const viewport = scroller.getBoundingClientRect()
          const top = scroller.scrollTop + rect.top - viewport.top - scroller.clientHeight / 2 + rect.height / 2
          if (!target) {
            try {
              scroller.scrollTo({ top: Math.max(0, top), behavior: 'auto' })
            } catch (_error) {
              scroller.scrollTop = Math.max(0, top)
            }
          }
          const settle = () => {
            if (!root.isConnected) return
            const liveRange = restoreAnchorRange(root, first)
            if (liveRange) {
              centerRangeInScrollers(liveRange)
              return
            }
            const live = root.querySelector(`[data-chat-node-key="${cssEscape(first.nodeKey)}"]`) || row
            if (live) alignRowInScrollers(live)
          }
          setTimeout(settle, 80)
          setTimeout(settle, 260)
        }
        if (attempt === 0) {
          setTimeout(() => {
            const live = sessionId === state.mainSessionId
              ? mainChatFlow(first)
              : branchChatFlow(sessionId)
            const liveRange = live && first ? restoreAnchorRange(live, first) : null
            if (liveRange) liveRange.startContainer.parentElement?.closest('[data-chat-node-key]')?.animate?.(
              [{ opacity: 0.55 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' },
            )
          }, 280)
        }
      }

      function revealBranch(branchId) {
        const branch = state.branches[branchId]
        if (!branch) return
        const parent = (branch.parentBranchId ? state.branches[branch.parentBranchId] : null)
          || (branch.anchor.sessionId !== state.mainSessionId ? branchBySession(branch.anchor.sessionId) : null)
        if (parent && parent.sessionId) {
          const active = activeStageBranch()
          if (!state.stageOpen || !active || active.id !== parent.id) {
            promote(parent.id)
          }
        }
        openPanel(branchId)
        scrollBranchIntoView(branch, 0)
      }

      function collapse(branchId) {
        const branch = state.branches[branchId]
        if (!branch) return
        branch.mode = 'collapsed'
        emit()
      }

      function deleteDraft(branchId) {
        const branch = state.branches[branchId]
        if (!branch || branch.sessionId || branch.prompted) return
        if (state.order.some(id => state.branches[id]?.parentBranchId === branchId)) return
        delete state.branches[branchId]
        state.order = state.order.filter(id => id !== branchId)
        const reference = refs.get(branchId)
        if (reference) {
          refs.delete(branchId)
          try { reference.release() } catch (_error) { /* already released */ }
        }
        if (state.stageIndex >= 0) {
          state.stageStack = state.stageStack.filter(id => id !== branchId)
          if (state.stageStack.length === 0) {
            state.stageOpen = false
            state.stageIndex = -1
          } else {
            state.stageIndex = Math.min(state.stageIndex, state.stageStack.length - 1)
          }
        }
        scheduleProject()
        emit()
      }

      function promote(branchId) {
        const branch = state.branches[branchId]
        if (!branch || !branch.prompted || !branch.sessionId) return
        for (const item of Object.values(state.branches)) {
          if (item.mode === 'panel' || item.mode === 'stage') item.mode = 'collapsed'
        }
        branch.mode = 'stage'
        if (!state.stageOpen) {
          state.stageStack = [branchId]
          state.stageIndex = 0
        } else {
          const stack = state.stageStack.slice(0, state.stageIndex + 1)
          stack.push(branchId)
          state.stageStack = stack
          state.stageIndex = stack.length - 1
        }
        state.stageOpen = true
        if (branch.sessionId && !refs.has(branch.id)) {
          branch.loading = true
          ensureReference(branch)
            .then(() => { branch.loading = false; emit() })
            .catch((error) => {
              branch.loading = false
              branch.status = 'error'
              branch.error = error instanceof Error ? error.message : String(error)
              forgetReference(branch.id)
              emit()
            })
        }
        emit()
      }

      function activeStageBranch() {
        if (!state.stageOpen || state.stageIndex < 0) return null
        const id = state.stageStack[state.stageIndex]
        return state.branches[id] || null
      }

      function stageGo(delta) {
        const next = state.stageIndex + delta
        if (next < 0 || next >= state.stageStack.length) return
        const previous = activeStageBranch()
        if (previous) previous.mode = 'collapsed'
        state.stageIndex = next
        const branch = activeStageBranch()
        if (!branch) return
        branch.mode = 'stage'
        if (branch.sessionId && !refs.has(branch.id)) {
          branch.loading = true
          ensureReference(branch)
            .then(() => { branch.loading = false; emit() })
            .catch((error) => {
              branch.loading = false
              branch.status = 'error'
              branch.error = error instanceof Error ? error.message : String(error)
              forgetReference(branch.id)
              emit()
            })
        }
        emit()
      }

      function stageRestore() {
        const branch = activeStageBranch()
        if (branch) branch.mode = 'panel'
        state.stageOpen = false
        state.stageStack = []
        state.stageIndex = -1
        state.treeOpen = false
        emit()
      }

      function stageClose() {
        const branch = activeStageBranch()
        if (branch) branch.mode = 'collapsed'
        state.stageOpen = false
        state.stageStack = []
        state.stageIndex = -1
        state.treeOpen = false
        emit()
      }

      function closeDock() {
        state.dockOpen = false
        emit()
      }

      function toggleDock() {
        state.dockOpen = !state.dockOpen
        emit()
      }

      function toggleTree() {
        state.treeOpen = !state.treeOpen
        emit()
      }

      function startPanelDrag(branchId, event, target = 'panel') {
        const branch = state.branches[branchId]
        const box = branch && branch[target]
        if (!branch || !box || !event || event.button !== 0) return
        if (event.target instanceof Element && event.target.closest('button, .ifu-resize')) return
        const width = box.w || (target === 'input' ? 440 : 360)
        const startX = box.x
        const startY = box.y
        trackPointer(event, (dx, dy) => {
          box.x = clamp(startX + dx, 8, Math.max(8, window.innerWidth - width - 8))
          box.y = clamp(startY + dy, 8, Math.max(8, window.innerHeight - 60))
          emit()
        }, persist)
      }

      function startPanelResize(branchId, event, direction, target = 'panel') {
        const branch = state.branches[branchId]
        const box = branch && branch[target]
        if (!branch || !box || !event || event.button !== 0) return
        event.stopPropagation()
        const start = { ...box }
        start.w = start.w || (target === 'input' ? 440 : 360)
        start.h = start.h || (target === 'input' ? 168 : 360)
        const minW = target === 'input' ? 260 : 300
        const minH = target === 'input' ? 120 : 220
        trackPointer(event, (dx, dy) => {
          let x = start.x
          let y = start.y
          let w = start.w
          let h = start.h
          if (direction.includes('e')) w = clamp(start.w + dx, minW, Math.max(minW, window.innerWidth - start.x - 8))
          if (direction.includes('s')) h = clamp(start.h + dy, minH, Math.max(minH, window.innerHeight - start.y - 8))
          if (direction.includes('w')) {
            x = clamp(start.x + dx, 8, start.x + start.w - minW)
            w = start.w + (start.x - x)
          }
          if (direction.includes('n')) {
            y = clamp(start.y + dy, 8, start.y + start.h - minH)
            h = start.h + (start.y - y)
          }
          box.x = x
          box.y = y
          box.w = w
          box.h = h
          emit()
        }, persist)
      }

      function startDockDrag(event) {
        if (!event || event.button !== 0) return
        if (event.target instanceof Element && event.target.closest('button, .ifu-resize')) return
        const dock = document.querySelector('.ifu-dock')
        if (!dock) return
        if (!state.dock) {
          const rect = dock.getBoundingClientRect()
          state.dock = { x: rect.left, y: rect.top, w: rect.width, h: rect.height }
          emit()
        }
        const start = { ...state.dock }
        trackPointer(event, (dx, dy) => {
          state.dock.x = clamp(start.x + dx, 8, Math.max(8, window.innerWidth - start.w - 8))
          state.dock.y = clamp(start.y + dy, 8, Math.max(8, window.innerHeight - 60))
          emit()
        }, persist)
      }

      function startDockResize(event, direction) {
        if (!event || event.button !== 0) return
        event.stopPropagation()
        const dock = document.querySelector('.ifu-dock')
        if (!dock) return
        if (!state.dock) {
          const rect = dock.getBoundingClientRect()
          state.dock = { x: rect.left, y: rect.top, w: rect.width, h: rect.height }
          emit()
        }
        const start = { ...state.dock }
        const minW = 220
        const minH = 120
        trackPointer(event, (dx, dy) => {
          let x = start.x
          let y = start.y
          let w = start.w
          let h = start.h
          if (direction.includes('e')) w = clamp(start.w + dx, minW, Math.max(minW, window.innerWidth - start.x - 8))
          if (direction.includes('s')) h = clamp(start.h + dy, minH, Math.max(minH, window.innerHeight - start.y - 8))
          if (direction.includes('w')) {
            x = clamp(start.x + dx, 8, start.x + start.w - minW)
            w = start.w + (start.x - x)
          }
          if (direction.includes('n')) {
            y = clamp(start.y + dy, 8, start.y + start.h - minH)
            h = start.h + (start.y - y)
          }
          state.dock = { x, y, w, h }
          emit()
        }, persist)
      }

      return app
    }

    // ---------------------------------------------------------------------
    // React components
    // ---------------------------------------------------------------------

    function findAppFrame() {
      let element = document.querySelector('[data-ifu-root]')
      while (element) {
        if (element instanceof HTMLElement && element.style && element.style.gridTemplateColumns) return element
        element = element.parentElement
      }
      return null
    }

    function readSidebarWidth(frame) {
      if (!frame) return 0
      const value = frame.style.gridTemplateColumns || getComputedStyle(frame).gridTemplateColumns
      const first = String(value || '').trim().split(/\s+/)[0]
      const width = Number.parseFloat(first)
      return Number.isFinite(width) ? width : 0
    }

    function useFrameLeft() {
      const [left, setLeft] = useState(() => readSidebarWidth(findAppFrame()))
      useLayoutEffect(() => {
        const frame = findAppFrame()
        if (!frame) return
        const update = () => setLeft(readSidebarWidth(frame))
        update()
        const observer = new MutationObserver(update)
        observer.observe(frame, { attributes: true, attributeFilter: ['style'] })
        window.addEventListener('resize', update)
        return () => {
          observer.disconnect()
          window.removeEventListener('resize', update)
        }
      }, [])
      return left
    }

    function useVersion() {
      return useSyncExternalStore(app.subscribe, app.getVersion, app.getVersion)
    }

    function SessionProbe(props) {
      const nodes = props.useChat(snapshot => snapshot.nodes)
      const timeline = props.useChat(snapshot => snapshot.timeline)
      useEffect(() => {
        if (app) app.setMainChat(props.sessionId, nodes, timeline)
      }, [props.sessionId, nodes, timeline])
      return null
    }

    function FixedChatView(props) {
      return h(React.Fragment, null, props.renderSlot('conversation.session', { view: 'chat' }))
    }

    function FollowupThread(props) {
      const nodes = props.useChat(snapshot => snapshot.nodes)
      const timeline = props.useChat(snapshot => snapshot.timeline)
      const running = props.useSession(snapshot => snapshot.running)
      const hostRef = useRef(null)
      useLayoutEffect(() => {
        if (app) app.setBranchChat(props.sessionId, nodes, timeline)
      }, [props.sessionId, nodes, timeline])
      const branchRecord = app ? app.branchBySession(props.sessionId) : null
      const branchId = props.branchId || (branchRecord ? branchRecord.id : null)
      const cutSeq = Number.isFinite(props.cutSeq) ? props.cutSeq : (branchRecord ? branchRecord.anchor.atSeq : undefined)
      useEffect(() => {
        if (app && branchId) app.setBranchRunning(branchId, running)
      }, [branchId, running])
      useLayoutEffect(() => {
        const host = hostRef.current
        if (!host) return
        const apply = () => hideInheritedRows(host, props.sessionId, cutSeq)
        apply()
        const observer = new MutationObserver(apply)
        observer.observe(host, { childList: true, subtree: true, characterData: true })
        const timer = setTimeout(() => {
          apply()
          const scroller = host.querySelector('[data-conversation-scroll]')
          if (scroller) scroller.scrollTop = scroller.scrollHeight
        }, 160)
        return () => {
          observer.disconnect()
          clearTimeout(timer)
        }
      }, [props.sessionId, cutSeq])
      return h('div', {
        ref: hostRef,
        className: 'ifu-thread',
        'data-ifu-session': props.sessionId,
      }, props.renderFactorySlot('conversation.content', {
        variant: 'embedded',
        phase: 'active',
        hero: false,
      }, {
        slots: { views: FixedChatView },
      }))
    }

    function IconButton(props) {
      return h('button', {
        type: 'button',
        className: `ifu-icon ${props.className || ''}`,
        title: props.title,
        'aria-label': props.title,
        onClick: props.onClick,
        disabled: props.disabled,
      }, props.children)
    }

    function Compose(props) {
      const { branch } = props
      const [text, setText] = useState(branch.question || '')
      const areaRef = useRef(null)
      useEffect(() => {
        if (areaRef.current) areaRef.current.focus()
      }, [])
      const sending = branch.status === 'sending'
      const submit = () => {
        if (sending) return
        app.send(branch.id, text)
      }
      return h('div', { className: 'ifu-compose' },
        h('div', { className: 'ifu-quote', title: branch.anchor.quote },
          h('div', { className: 'ifu-quote-label' }, `${app.t('quote')} · ${app.t('basedOn')} ${branch.parentBranchId ? `#${app.state.branches[branch.parentBranchId]?.number ?? ''}` : app.t('main')}`),
          h('div', { className: 'ifu-quote-text' }, branch.anchor.quote.length > 220 ? `${branch.anchor.quote.slice(0, 219)}…` : branch.anchor.quote),
        ),
        h('textarea', {
          ref: areaRef,
          className: 'ifu-textarea',
          value: text,
          placeholder: app.t('empty'),
          rows: 3,
          onChange: event => { setText(event.target.value); app.setDraftText(branch.id, event.target.value) },
          onKeyDown: event => {
            if (event.key !== 'Enter' || event.shiftKey) return
            if (event.nativeEvent && (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)) return
            event.preventDefault()
            submit()
          },
        }),
        branch.error ? h('div', { className: 'ifu-error', role: 'alert' }, branch.error) : null,
        h('div', { className: 'ifu-compose-foot' },
          h('span', { className: 'ifu-hint' }, app.t('sendHint')),
          h('div', { className: 'ifu-grow' }),
          h('button', {
            type: 'button',
            className: 'ifu-send',
            disabled: sending,
            onClick: submit,
          }, sending ? app.t('sendingAction') : (branch.error ? app.t('retry') : app.t('send'))),
        ),
      )
    }

    function ThreadHost(props) {
      const { branch, SessionProvider, renderSlot } = props
      const reference = app.refs.get(branch.id)
      if (!reference) {
        return h('div', { className: 'ifu-loading' }, branch.error || app.t('sending'))
      }
      return h(SessionProvider, { session: reference },
        h('div', {
          className: 'ifu-thread-host',
          'data-ifu-session': branch.sessionId,
        }, renderSlot('followup.thread', { branchId: branch.id, cutSeq: branch.anchor.atSeq })),
      )
    }

    function InputWindow(props) {
      const { branch } = props
      useVersion()
      const initial = branch.question || ''
      const [text, setText] = useState(initial)
      const areaRef = useRef(null)
      useEffect(() => {
        if (areaRef.current) areaRef.current.focus()
      }, [])
      const box = branch.input || defaultInputBox(branch.panel)
      const width = Math.min(box.w || 440, Math.max(220, window.innerWidth - 24))
      const height = Math.min(box.h || 168, Math.max(120, window.innerHeight - 24))
      const left = clamp(box.x, 12, Math.max(12, window.innerWidth - width - 12))
      const top = clamp(box.y, 12, Math.max(12, window.innerHeight - height - 12))
      const sending = branch.status === 'sending'
      const submit = () => {
        if (sending) return
        const value = text.trim()
        if (!value) return
        const pending = app.send(branch.id, value)
        Promise.resolve(pending).then((ok) => {
          if (!ok) return
          setText('')
          app.setInputText(branch.id, '')
        })
      }
      return h('section', {
        className: 'ifu-panel ifu-input-panel',
        'data-ifu-input-panel': '',
        style: {
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
          zIndex: app.state.stageOpen ? 351 : 101,
          ...colorVars(branch.color),
        },
        role: 'dialog',
        'aria-label': `${app.t('branchN')} #${branch.number} ${app.t('input')}`,
      },
        h('header', { className: 'ifu-head', onPointerDown: event => app.startPanelDrag(branch.id, event, 'input') },
          h('span', { className: 'ifu-dot' }),
          h('div', { className: 'ifu-title-wrap' },
            h('div', { className: 'ifu-title' }, `${app.t('input')} · #${branch.number}`),
            h('div', { className: 'ifu-sub' }, statusLabel(branch)),
          ),
          h('div', { className: 'ifu-grow' }),
          h(IconButton, { title: app.t('collapse'), onClick: () => app.collapse(branch.id) }, '—'),
          branch.sessionId ? null : h(IconButton, {
            title: app.t('deleteDraft'),
            className: 'ifu-danger',
            onClick: () => app.deleteDraft(branch.id),
          }, '⌫'),
        ),
        h('div', { className: 'ifu-input-body' },
          h('textarea', {
            ref: areaRef,
            className: 'ifu-textarea',
            value: text,
            placeholder: app.t('empty'),
            rows: 3,
            onChange: event => { setText(event.target.value); app.setInputText(branch.id, event.target.value) },
            onKeyDown: event => {
              if (event.key !== 'Enter' || event.shiftKey) return
              if (event.nativeEvent && (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)) return
              event.preventDefault()
              submit()
            },
          }),
          branch.error ? h('div', { className: 'ifu-error', role: 'alert' }, branch.error) : null,
          h('div', { className: 'ifu-compose-foot' },
            h('span', { className: 'ifu-hint' }, app.t('sendHint')),
            h('div', { className: 'ifu-grow' }),
            h('button', {
              type: 'button',
              className: 'ifu-send',
              disabled: sending,
              onClick: submit,
            }, sending ? app.t('sendingAction') : app.t('send')),
          ),
        ),
        ...['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(direction => h('div', {
          key: direction,
          className: `ifu-resize ifu-${direction}`,
          onPointerDown: event => app.startPanelResize(branch.id, event, direction, 'input'),
        })),
      )
    }

    function BranchPanel(props) {
      const { branch, SessionProvider, renderSlot } = props
      useVersion()
      if (!branch.prompted) return h(InputWindow, { key: `${branch.id}-input`, branch })
      const parent = branch.parentBranchId ? app.state.branches[branch.parentBranchId] : null
      const basis = parent ? `${app.t('basedOn')} #${parent.number}` : `${app.t('basedOn')} ${app.t('main')}`
      const reference = app.refs.get(branch.id)
      const showThread = branch.prompted && reference && !branch.loading
      const showDraft = !branch.prompted
      const panelWidth = Math.min(branch.panel.w || 440, Math.max(200, window.innerWidth - 24))
      const panelHeight = Math.min(branch.panel.h || 360, Math.max(220, window.innerHeight - 24))
      const panelLeft = clamp(branch.panel.x, 12, Math.max(12, window.innerWidth - panelWidth - 12))
      const panelTop = clamp(branch.panel.y, 12, Math.max(12, window.innerHeight - panelHeight - 12))
      return h(React.Fragment, null,
        h('section', {
          className: 'ifu-panel',
          'data-ifu-panel': '',
          style: {
            left: `${panelLeft}px`,
            top: `${panelTop}px`,
            width: `${panelWidth}px`,
            height: `${panelHeight}px`,
            zIndex: app.state.stageOpen ? 350 : 100,
            ...colorVars(branch.color),
          },
          role: 'dialog',
          'aria-label': `${app.t('branchN')} #${branch.number}`,
        },
          h('header', { className: 'ifu-head', onPointerDown: event => app.startPanelDrag(branch.id, event) },
            h('span', { className: 'ifu-dot' }),
            h('div', { className: 'ifu-title-wrap' },
              h('div', { className: 'ifu-title' }, `${app.t('branchN')} #${branch.number}`),
              h('div', { className: 'ifu-sub' }, `${basis} · ${statusLabel(branch)}`),
            ),
            h('div', { className: 'ifu-grow' }),
            h(IconButton, { title: app.t('expand'), onClick: () => app.promote(branch.id), disabled: !branch.prompted || !branch.sessionId }, '↗'),
            h(IconButton, { title: app.t('collapse'), onClick: () => app.collapse(branch.id) }, '—'),
            branch.sessionId || branch.prompted
              ? h(IconButton, { title: app.t('close'), onClick: () => app.collapse(branch.id) }, '✕')
              : h(IconButton, { title: app.t('deleteDraft'), className: 'ifu-danger', onClick: () => app.deleteDraft(branch.id) }, '⌫'),
          ),
          h('div', { className: 'ifu-panel-body' },
            showThread
              ? h(ThreadHost, { key: branch.id, branch, SessionProvider, renderSlot })
              : showDraft
                ? h('div', { className: 'ifu-compose-center' },
                    h('div', { className: 'ifu-draft-quote' },
                      h('div', { className: 'ifu-quote-label' }, `${app.t('quote')} · ${basis}`),
                      h('div', { className: 'ifu-quote-text' }, branch.anchor.quote),
                      h('div', { className: 'ifu-draft-wait' }, app.t('draftWait')),
                    ),
                  )
                : h('div', { className: 'ifu-loading' }, branch.error || app.t('sending')),
          ),
          ...['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(direction => h('div', {
            key: direction,
            className: `ifu-resize ifu-${direction}`,
            onPointerDown: event => app.startPanelResize(branch.id, event, direction),
          })),
        ),

      )
    }

    function StageQuote(props) {
      const { branch } = props
      const parent = branch.parentBranchId ? app.state.branches[branch.parentBranchId] : null
      const basis = parent ? `#${parent.number}` : app.t('main')
      return h('div', { className: 'ifu-stage-quote', title: branch.anchor.quote },
        h('div', { className: 'ifu-stage-quote-label' },
          h('span', { className: 'ifu-dot' }),
          `${app.t('quote')} · ${app.t('basedOn')} ${basis}`,
        ),
        h('div', { className: 'ifu-stage-quote-text' }, branch.anchor.quote),
      )
    }

    function StageThread(props) {
      const { branch, SessionProvider, renderSlot } = props
      const reference = app.refs.get(branch.id)
      const hostRef = useRef(null)
      useLayoutEffect(() => {
        const host = hostRef.current
        if (!host) return undefined
        const mark = () => {
          const quote = host.querySelector('[data-chat-flow-kind="user"] blockquote')
          if (quote) quote.classList.add('ifu-stage-native-quote')
        }
        mark()
        const observer = new MutationObserver(mark)
        observer.observe(host, { childList: true, subtree: true, characterData: true })
        return () => observer.disconnect()
      }, [branch.id])
      if (!reference) return h('div', { className: 'ifu-loading' }, branch.error || app.t('sending'))
      return h(SessionProvider, { session: reference },
        h('div', {
          ref: hostRef,
          className: 'ifu-thread-host ifu-stage-thread',
          'data-ifu-session': branch.sessionId,
        }, renderSlot('followup.thread', { branchId: branch.id, cutSeq: branch.anchor.atSeq })),
      )
    }

    function BranchTree() {
      useVersion()
      const [scope, setScope] = useState('all')
      const state = app.state
      const branches = state.order
        .map(id => state.branches[id])
        .filter(branch => branch && branch.rootSessionId === state.mainSessionId)
      if (!state.treeOpen) return null
      const activeId = state.stageOpen && state.stageIndex >= 0 ? state.stageStack[state.stageIndex] : null
      const activeBranch = activeId ? state.branches[activeId] : null
      const path = activeBranch ? pathOf(state, activeBranch) : []
      const pathIds = new Set(path.map(branch => branch.id))
      const rows = treeOrder(state, branches)
      const visibleRows = scope === 'path' && activeBranch
        ? rows.filter(row => pathIds.has(row.branch.id))
        : rows
      const contextText = path.length > 0
        ? `${app.t('main')}${path.map(branch => ` → #${branch.number}`).join('')}`
        : app.t('main')
      return h('aside', { className: 'ifu-tree', 'data-ifu-no-select': '' },
        h('div', { className: 'ifu-tree-head' },
          h('span', null, app.t('tree')),
          h('div', { className: 'ifu-tree-tabs' },
            h('button', {
              type: 'button',
              className: `ifu-tree-tab ${scope === 'path' ? 'is-active' : ''}`,
              onClick: () => setScope('path'),
            }, app.t('path')),
            h('button', {
              type: 'button',
              className: `ifu-tree-tab ${scope === 'all' ? 'is-active' : ''}`,
              onClick: () => setScope('all'),
            }, app.t('all')),
          ),
          h('button', { type: 'button', className: 'ifu-icon', title: app.t('close'), onClick: () => app.toggleTree() }, '✕'),
        ),
        h('div', { className: 'ifu-tree-list' },
          h('div', {
            className: 'ifu-tree-root',
            role: 'button',
            tabIndex: 0,
            onClick: () => app.stageClose(),
            onKeyDown: (event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              app.stageClose()
            },
          },
            h('span', { className: 'ifu-dot' }),
            h('span', { className: 'ifu-tree-root-name' }, app.t('main')),
            h('span', { className: 'ifu-tree-root-tag' }, 'ROOT'),
            h('span', { className: 'ifu-tree-root-meta' }, app.t('contextStart')),
          ),
          visibleRows.map(({ branch, depth }) => {
            const isDraft = !branch.sessionId && !branch.prompted
            const parent = branch.parentBranchId ? state.branches[branch.parentBranchId] : null
            const parentLabel = parent ? `${app.t('main')} · #${parent.number}` : app.t('main')
            const title = branch.question || branch.anchor.quote || app.t('waiting')
            const inPath = pathIds.has(branch.id)
            return h('div', {
              key: branch.id,
              role: 'button',
              tabIndex: 0,
              className: `ifu-tree-row ${branch.id === activeId ? 'is-current' : ''} ${inPath ? 'is-path' : ''}`,
              style: { paddingLeft: `${10 + depth * 14}px`, ...colorVars(branch.color) },
              onClick: () => {
                if (branch.id === activeId) return
                if (branch.parentBranchId && state.branches[branch.parentBranchId]) {
                  app.revealBranch(branch.id)
                  if (state.treeOpen) app.toggleTree()
                } else if (branch.prompted && branch.sessionId) app.promote(branch.id)
                else app.openPanel(branch.id)
              },
              onKeyDown: (event) => {
                if (event.target !== event.currentTarget) return
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                if (branch.parentBranchId && state.branches[branch.parentBranchId]) {
                  app.revealBranch(branch.id)
                  if (state.treeOpen) app.toggleTree()
                } else if (branch.prompted && branch.sessionId) app.promote(branch.id)
                else app.openPanel(branch.id)
              },
              title: `${app.t('switchBranch')} #${branch.number}`,
            },
              h('div', { className: 'ifu-tree-top' },
                h('span', { className: 'ifu-dot' }),
                h('span', { className: 'ifu-tree-num' }, `#${branch.number}`),
                h('span', { className: 'ifu-tree-title' }, snippet(title, 36)),
                branch.id === activeId
                  ? h('span', { className: 'ifu-tree-tag' }, app.t('current'))
                  : inPath
                    ? h('span', { className: 'ifu-tree-tag is-context' }, app.t('context'))
                    : null,
                isDraft ? h('button', {
                  type: 'button',
                  className: 'ifu-tree-delete',
                  title: app.t('deleteDraft'),
                  onClick: (event) => { event.stopPropagation(); app.deleteDraft(branch.id) },
                }, '⌫') : null,
              ),
              h('div', { className: 'ifu-tree-quote' }, snippet(branch.anchor.quote, 72)),
              h('div', { className: 'ifu-tree-meta' },
                h('span', null, `${app.t('basedOn')} ${parentLabel}`),
                h('span', null, statusLabel(branch)),
              ),
            )
          }),
        ),
        h('div', { className: 'ifu-tree-note' },
          app.t('treeNote', { context: contextText }),
        ),
      )
    }

    function Stage(props) {
      const { branch, SessionProvider, renderSlot } = props
      useVersion()
      const frameLeft = useFrameLeft()
      const state = app.state
      const path = pathOf(state, branch)
      const index = state.stageIndex
      const total = state.stageStack.length
      const reference = app.refs.get(branch.id)
      return h('div', {
        className: 'ifu-stage',
        'data-ifu-stage': '',
        style: { left: `${frameLeft}px`, ...colorVars(branch.color) },
      },
        h('header', { className: 'ifu-stage-bar' },
          h('button', {
            type: 'button',
            className: 'ifu-stage-back',
            onClick: () => index <= 0 ? app.stageClose() : app.stageGo(-1),
            title: index <= 0 ? app.t('main') : app.t('back'),
          }, `← ${app.t('back')}`),
          h('span', { className: 'ifu-stage-count' }, `${index + 1}/${total}`),
          h('button', {
            type: 'button',
            className: 'ifu-stage-back',
            disabled: index >= total - 1,
            onClick: () => app.stageGo(1),
          }, app.t('forward'), ' →'),
          h('span', { className: 'ifu-stage-divider' }),
          h('div', { className: 'ifu-crumbs' },
            h('button', {
              type: 'button',
              className: 'ifu-crumb-btn',
              onClick: () => app.stageClose(),
              title: app.t('main'),
            }, app.t('main')),
            ...path.flatMap(item => [
              h('span', { key: `sep-${item.id}`, className: 'ifu-crumb-sep' }, '›'),
              h('button', {
                key: `crumb-${item.id}`,
                type: 'button',
                className: `ifu-crumb-btn ${item.id === branch.id ? 'ifu-crumb-current' : ''}`,
                onClick: () => {
                  if (item.id === branch.id) return
                  app.promote(item.id)
                },
                title: `${app.t('switchBranch')} #${item.number}`,
              }, `#${item.number}`),
            ]),
          ),
          h('span', { className: 'ifu-context-chip' }, `${app.t('context')} · ${path.length} ${app.t('stages')}`),
          h('div', { className: 'ifu-grow' }),
          h('span', { className: 'ifu-stage-status' }, statusLabel(branch)),
          h('button', { type: 'button', className: 'ifu-stage-action', onClick: () => app.toggleTree() }, '▤ ', app.t('tree')),
          h('button', { type: 'button', className: 'ifu-stage-action', onClick: () => app.stageRestore() }, '↘ ', app.t('restore')),
          h('button', { type: 'button', className: 'ifu-stage-action', onClick: () => app.stageClose() }, '✕ ', app.t('close')),
        ),
        h('div', { className: 'ifu-stage-tip' }, app.t('stageHint')),
        h('div', { className: 'ifu-stage-body' },
          h(StageQuote, { branch }),
          reference && !branch.loading
            ? h(StageThread, { key: branch.id, branch, SessionProvider, renderSlot })
            : h('div', { className: 'ifu-loading' }, branch.error || app.t('sending')),
        ),
        h(BranchTree),
      )
    }

    function HighlightOverlay(props) {
      if (typeof CSS !== 'undefined' && CSS.highlights && typeof Highlight !== 'undefined') return null
      return h(HighlightOverlayFallback, props)
    }

    function HighlightOverlayFallback(props) {
      const version = useVersion()
      const [rects, setRects] = useState([])
      const compute = useCallback(() => {
        if (!app) return
        const next = app.highlightRects(Boolean(props.thread))
        setRects(previous => {
          if (previous.length !== next.length) return next
          for (let i = 0; i < next.length; i += 1) {
            const a = previous[i]
            const b = next[i]
            if (a.id !== b.id || a.x !== b.x || a.y !== b.y || a.w !== b.w || a.h !== b.h) return next
          }
          return previous
        })
      }, [props.thread])
      useEffect(() => {
        compute()
      }, [compute, version])
      useEffect(() => {
        let frame = null
        const onMove = () => {
          if (frame !== null) return
          frame = requestAnimationFrame(() => { frame = null; compute() })
        }
        window.addEventListener('scroll', onMove, true)
        document.addEventListener('scroll', onMove, true)
        window.addEventListener('resize', onMove)
        const observer = new MutationObserver(onMove)
        if (document.body) observer.observe(document.body, { childList: true, subtree: true, characterData: true })
        return () => {
          window.removeEventListener('scroll', onMove, true)
          document.removeEventListener('scroll', onMove, true)
          window.removeEventListener('resize', onMove)
          observer.disconnect()
          if (frame !== null) cancelAnimationFrame(frame)
        }
      }, [compute])
      return rects.map(rect => h('div', {
        key: rect.id,
        className: `ifu-hl ${props.thread ? 'ifu-hl-thread' : 'ifu-hl-main'}`,
        style: {
          left: `${rect.x}px`,
          top: `${rect.y}px`,
          width: `${rect.w}px`,
          height: `${rect.h}px`,
          ...colorVars(rect.color),
        },
      }))
    }

    function MarkBadges() {
      const version = useVersion()
      const [items, setItems] = useState([])
      const [scrolling, setScrolling] = useState(false)
      const compute = useCallback(() => {
        if (!app) return
        const next = app.markItems()
        setItems(previous => {
          if (previous.length !== next.length) return next
          for (let i = 0; i < next.length; i += 1) {
            if (previous[i].id !== next[i].id || previous[i].x !== next[i].x || previous[i].y !== next[i].y) return next
          }
          return previous
        })
      }, [])
      useEffect(() => {
        compute()
        let frame = null
        let hideTimer = null
        const scheduleCompute = () => {
          if (frame !== null) return
          frame = requestAnimationFrame(() => { frame = null; compute() })
        }
        const onScroll = () => {
          setScrolling(true)
          if (hideTimer !== null) clearTimeout(hideTimer)
          hideTimer = setTimeout(() => {
            hideTimer = null
            setScrolling(false)
            compute()
          }, 140)
        }
        const onResize = () => scheduleCompute()
        window.addEventListener('scroll', onScroll, true)
        document.addEventListener('scroll', onScroll, true)
        window.addEventListener('resize', onResize)
        const observer = new MutationObserver(scheduleCompute)
        if (document.body) observer.observe(document.body, { childList: true, subtree: true, characterData: true })
        return () => {
          window.removeEventListener('scroll', onScroll, true)
          document.removeEventListener('scroll', onScroll, true)
          window.removeEventListener('resize', onResize)
          observer.disconnect()
          if (frame !== null) cancelAnimationFrame(frame)
          if (hideTimer !== null) clearTimeout(hideTimer)
        }
      }, [compute])
      useEffect(() => {
        compute()
      }, [compute, version])
      if (scrolling) return null
      return items.map(item => h('button', {
        key: item.id,
        type: 'button',
        className: 'ifu-badge',
        style: { left: `${item.x}px`, top: `${item.y}px`, ...colorVars(item.color) },
        title: `#${item.number} ${snippet(item.quote, 48)}`,
        'data-ifu-no-select': '',
        onClick: () => app.openPanel(item.id),
      }, h('span', { className: 'ifu-dot' }), `#${item.number}`))
    }

    function BranchDock() {
      const state = app.state
      useVersion()
      const branches = state.order
        .map(id => state.branches[id])
        .filter(branch => branch && branch.rootSessionId === state.mainSessionId)
      if (branches.length === 0 || state.stageOpen) return null
      if (!state.dockOpen) {
        return h('button', {
          type: 'button',
          className: 'ifu-dock-collapsed',
          'data-ifu-dock': '',
          onClick: () => app.toggleDock(),
        }, `◉ ${app.t('dock')} · ${branches.length}`)
      }
      const dockStyle = state.dock
        ? {
          left: `${clamp(state.dock.x, 8, Math.max(8, window.innerWidth - (state.dock.w || 286) - 8))}px`,
          top: `${clamp(state.dock.y, 8, Math.max(8, window.innerHeight - (state.dock.h || 260) - 8))}px`,
          width: `${state.dock.w || 286}px`,
          height: `${state.dock.h || 260}px`,
          right: 'auto',
          bottom: 'auto',
        }
        : {}
      return h('aside', { className: 'ifu-dock', 'data-ifu-dock': '', style: dockStyle },
        h('div', { className: 'ifu-dock-head', onPointerDown: event => app.startDockDrag(event) },
          h('span', null, `${app.t('dock')} · ${branches.length}`),
          h('button', {
            type: 'button',
            className: 'ifu-dock-toggle',
            title: app.t('collapseDock'),
            onClick: () => app.closeDock(),
          }, '—'),
        ),
        h('div', { className: 'ifu-dock-list' },
          branches.map(branch => {
            const isDraft = !branch.sessionId && !branch.prompted
            return h('div', {
              key: branch.id,
              role: 'button',
              tabIndex: 0,
              className: `ifu-dock-row ${branch.mode === 'panel' ? 'is-open' : ''}`,
              onClick: () => app.revealBranch(branch.id),
              onKeyDown: (event) => {
                if (event.target !== event.currentTarget) return
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                app.revealBranch(branch.id)
              },
              title: `${app.t('switchBranch')}: #${branch.number}`,
            },
              h('span', { className: 'ifu-dot', style: colorVars(branch.color) }),
              h('span', { className: 'ifu-dock-num' }, `#${branch.number}`),
              h('span', { className: 'ifu-dock-text' }, snippet(branch.question || branch.anchor.quote, 42)),
              h('span', { className: 'ifu-dock-status' }, statusLabel(branch)),
              isDraft ? h('button', {
                type: 'button',
                className: 'ifu-dock-delete',
                title: app.t('deleteDraft'),
                onClick: (event) => { event.stopPropagation(); app.deleteDraft(branch.id) },
              }, '⌫') : null,
            )
          }),
        ),
        ...['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(direction => h('div', {
          key: direction,
          className: `ifu-resize ifu-${direction}`,
          onPointerDown: event => app.startDockResize(event, direction),
        })),
      )
    }

    function SelectionChip() {
      const chip = app.state.chip
      if (!chip) return null
      return h('button', {
        type: 'button',
        className: 'ifu-chip',
        'data-ifu-chip': '',
        style: { left: `${chip.x}px`, top: `${chip.y}px` },
        title: app.t('chipHint'),
        onMouseDown: event => event.preventDefault(),
        onClick: () => {
          const x = clamp(chip.x - 120, 12, window.innerWidth - PANEL_WIDTH - 12)
          const y = clamp(chip.y + 38, 12, window.innerHeight - 320)
          app.openDraft(chip.anchor, x, y)
        },
      }, '✦ ', app.t('chip'))
    }

    function Notice() {
      useVersion()
      if (!app || !app.state.notice) return null
      return h('div', { className: 'ifu-notice', role: 'status' }, app.state.notice)
    }

    function FollowupLayer(props) {
      useVersion()
      const state = app.state
      const branches = state.order.map(id => state.branches[id]).filter(Boolean)
      const panels = branches.filter(branch => branch.mode === 'panel')
      const stageBranch = state.stageOpen && state.stageIndex >= 0
        ? state.branches[state.stageStack[state.stageIndex]]
        : null
      useEffect(() => {
        app.scheduleProject()
      })
      return h('div', { className: 'ifu-root', 'data-ifu-root': '' },
        stageBranch
          ? h(Stage, {
            branch: stageBranch,
            SessionProvider: props.SessionProvider,
            renderSlot: props.renderSlot,
          })
          : null,
        panels.map(branch => h(BranchPanel, {
          key: branch.id,
          branch,
          SessionProvider: props.SessionProvider,
          renderSlot: props.renderSlot,
        })),
        h(HighlightOverlay, { thread: false }),
        h(HighlightOverlay, { thread: true }),
        h(BranchDock),
        h(SelectionChip),
        h(Notice),
      )
    }

    // ---------------------------------------------------------------------
    // styles
    // ---------------------------------------------------------------------

    const STYLES = `
      :root {
        --ifu-c0:#C25A3A; --ifu-t0:#F7E6DF; --ifu-c1:#207F73; --ifu-t1:#DFF1ED;
        --ifu-c2:#5B63C4; --ifu-t2:#E7E8FA; --ifu-c3:#A66B12; --ifu-t3:#F7EBD8;
        --ifu-c4:#B0446E; --ifu-t4:#F7E3EC; --ifu-c5:#3D6FA8; --ifu-t5:#E3EDF8;
        --ifu-c6:#7A4FA8; --ifu-t6:#EEE4F8; --ifu-c7:#5F7A2E; --ifu-t7:#EAF0DC;
        --ifu-h0:rgba(194,90,58,.20); --ifu-h1:rgba(32,127,115,.20); --ifu-h2:rgba(91,99,196,.20); --ifu-h3:rgba(166,107,18,.20);
        --ifu-h4:rgba(176,68,110,.20); --ifu-h5:rgba(61,111,168,.20); --ifu-h6:rgba(122,79,168,.20); --ifu-h7:rgba(95,122,46,.20);
      }
      body[data-ds-dark-theme] {
        --ifu-c0:#F08A68; --ifu-t0:rgba(240,138,104,.16); --ifu-c1:#5FC9B8; --ifu-t1:rgba(95,201,184,.15);
        --ifu-c2:#9AA4FF; --ifu-t2:rgba(154,164,255,.15); --ifu-c3:#E3B05E; --ifu-t3:rgba(227,176,94,.15);
        --ifu-c4:#E889B0; --ifu-t4:rgba(232,137,176,.15); --ifu-c5:#7FB2E8; --ifu-t5:rgba(127,178,232,.15);
        --ifu-c6:#C29BE8; --ifu-t6:rgba(194,155,232,.15); --ifu-c7:#A9C46A; --ifu-t7:rgba(169,196,106,.15);
        --ifu-h0:rgba(240,138,104,.24); --ifu-h1:rgba(95,201,184,.24); --ifu-h2:rgba(154,164,255,.24); --ifu-h3:rgba(227,176,94,.24);
        --ifu-h4:rgba(232,137,176,.24); --ifu-h5:rgba(127,178,232,.24); --ifu-h6:rgba(194,155,232,.24); --ifu-h7:rgba(169,196,106,.24);
      }
      ::highlight(ifu-c0){ background-color:var(--ifu-t0,#F7E6DF); text-decoration:underline; text-decoration-color:var(--ifu-c0,#C25A3A); text-decoration-thickness:2px; text-underline-offset:3px; }
      ::highlight(ifu-c1){ background-color:var(--ifu-t1,#DFF1ED); text-decoration:underline; text-decoration-color:var(--ifu-c1,#207F73); text-decoration-thickness:2px; text-underline-offset:3px; }
      ::highlight(ifu-c2){ background-color:var(--ifu-t2,#E7E8FA); text-decoration:underline; text-decoration-color:var(--ifu-c2,#5B63C4); text-decoration-thickness:2px; text-underline-offset:3px; }
      ::highlight(ifu-c3){ background-color:var(--ifu-t3,#F7EBD8); text-decoration:underline; text-decoration-color:var(--ifu-c3,#A66B12); text-decoration-thickness:2px; text-underline-offset:3px; }
      ::highlight(ifu-c4){ background-color:var(--ifu-t4,#F7E3EC); text-decoration:underline; text-decoration-color:var(--ifu-c4,#B0446E); text-decoration-thickness:2px; text-underline-offset:3px; }
      ::highlight(ifu-c5){ background-color:var(--ifu-t5,#E3EDF8); text-decoration:underline; text-decoration-color:var(--ifu-c5,#3D6FA8); text-decoration-thickness:2px; text-underline-offset:3px; }
      ::highlight(ifu-c6){ background-color:var(--ifu-t6,#EEE4F8); text-decoration:underline; text-decoration-color:var(--ifu-c6,#7A4FA8); text-decoration-thickness:2px; text-underline-offset:3px; }
      ::highlight(ifu-c7){ background-color:var(--ifu-t7,#EAF0DC); text-decoration:underline; text-decoration-color:var(--ifu-c7,#5F7A2E); text-decoration-thickness:2px; text-underline-offset:3px; }
      /* Literal colors: a highlight pseudo-element may not resolve custom properties reliably. */
      ::highlight(ifu-c0){ background-color:rgba(194,90,58,.20); text-decoration-color:#C25A3A; }
      ::highlight(ifu-c1){ background-color:rgba(32,127,115,.20); text-decoration-color:#207F73; }
      ::highlight(ifu-c2){ background-color:rgba(91,99,196,.20); text-decoration-color:#5B63C4; }
      ::highlight(ifu-c3){ background-color:rgba(166,107,18,.20); text-decoration-color:#A66B12; }
      ::highlight(ifu-c4){ background-color:rgba(176,68,110,.20); text-decoration-color:#B0446E; }
      ::highlight(ifu-c5){ background-color:rgba(61,111,168,.20); text-decoration-color:#3D6FA8; }
      ::highlight(ifu-c6){ background-color:rgba(122,79,168,.20); text-decoration-color:#7A4FA8; }
      ::highlight(ifu-c7){ background-color:rgba(95,122,46,.20); text-decoration-color:#5F7A2E; }
      body[data-ds-dark-theme] ::highlight(ifu-c0){ background-color:rgba(240,138,104,.24); text-decoration-color:#F08A68; }
      body[data-ds-dark-theme] ::highlight(ifu-c1){ background-color:rgba(95,201,184,.24); text-decoration-color:#5FC9B8; }
      body[data-ds-dark-theme] ::highlight(ifu-c2){ background-color:rgba(154,164,255,.24); text-decoration-color:#9AA4FF; }
      body[data-ds-dark-theme] ::highlight(ifu-c3){ background-color:rgba(227,176,94,.24); text-decoration-color:#E3B05E; }
      body[data-ds-dark-theme] ::highlight(ifu-c4){ background-color:rgba(232,137,176,.24); text-decoration-color:#E889B0; }
      body[data-ds-dark-theme] ::highlight(ifu-c5){ background-color:rgba(127,178,232,.24); text-decoration-color:#7FB2E8; }
      body[data-ds-dark-theme] ::highlight(ifu-c6){ background-color:rgba(194,155,232,.24); text-decoration-color:#C29BE8; }
      body[data-ds-dark-theme] ::highlight(ifu-c7){ background-color:rgba(169,196,106,.24); text-decoration-color:#A9C46A; }
      ::highlight(ifu-c0), ::highlight(ifu-c1), ::highlight(ifu-c2), ::highlight(ifu-c3), ::highlight(ifu-c4), ::highlight(ifu-c5), ::highlight(ifu-c6), ::highlight(ifu-c7) { text-decoration:underline; text-decoration-thickness:2px; text-underline-offset:3px; }
      .ifu-sidebar-section { display:flex; flex-direction:column; min-width:0; }
      .ifu-sidebar-section > * + * { margin-top:2px; }
      .ifu-sidebar-section .ifu-sidebar-clone { width:100%; box-sizing:border-box; cursor:pointer; }
      .ifu-sidebar-section .ifu-sidebar-clone button { display:none !important; }
      .ifu-sidebar-clone-fallback { display:flex; align-items:center; gap:6px; min-height:28px; padding:6px 8px; border-radius:7px; color:var(--dsw-alias-label-primary,#0f1115); font-size:10px; }
      .ifu-sidebar-clone-fallback:hover { background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06)); }
      .ifu-sidebar-clone-num { flex:0 0 auto; font:600 9px/1 var(--dsw-font-family-code,monospace); color:var(--dsw-alias-label-secondary,#3c4043); }
      .ifu-sidebar-clone-title { min-width:0; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .ifu-sidebar-clone-status { flex:0 0 auto; font-size:8px; color:var(--dsw-alias-label-caption,#979da6); }
      .ifu-sidebar-group { display:flex; align-items:center; width:100%; min-width:100%; box-sizing:border-box; padding:5px 8px; border:0; background:transparent; color:var(--dsw-alias-label-tertiary,#61666b); font:9.5px/1.4 var(--dsw-font-family-text,sans-serif); cursor:pointer; text-align:left; }
      .ifu-sidebar-group:hover { background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06)); }
      .ifu-sidebar-hidden { display:none !important; }
      [data-ifu-overflow-hidden] { display:none !important; }
      .ifu-root { position:fixed; inset:0; pointer-events:none; z-index:60; }
      .ifu-hl { position:fixed; z-index:65; pointer-events:none; border-radius:2px; background:var(--ifu-h); border-bottom:2px solid var(--ifu-c); }
      .ifu-hl-thread { z-index:360; }
      .ifu-grow { flex:1; }
      .ifu-chip { position:fixed; z-index:380; -webkit-app-region:no-drag; pointer-events:auto; height:28px; padding:0 10px; border:0; border-radius:8px; background:var(--dsw-alias-label-primary,#17191d); color:var(--dsw-alias-bg-layer-1,#fff); font:500 11.5px/1 var(--dsw-font-family-text,-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif); box-shadow:0 8px 22px rgba(15,17,21,.22); cursor:pointer; }
      .ifu-panel { position:fixed; z-index:100; -webkit-app-region:no-drag; box-sizing:border-box; width:${PANEL_WIDTH}px; max-width:calc(100vw - 24px); max-height:calc(100vh - 16px); pointer-events:auto; display:flex; flex-direction:column; overflow:hidden; border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.12)); border-radius:16px; background:var(--dsw-alias-bg-layer-1,#fff); color:var(--dsw-alias-label-primary,#0f1115); box-shadow:0 24px 64px rgba(15,17,21,.16),0 6px 18px rgba(15,17,21,.08); }
      .ifu-head { height:44px; flex:0 0 44px; display:flex; align-items:center; gap:8px; padding:0 8px 0 12px; border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.06)); cursor:grab; user-select:none; }
      .ifu-head:active { cursor:grabbing; }
      .ifu-dot { width:8px; height:8px; border-radius:50%; background:var(--ifu-c); box-shadow:0 0 0 3px var(--ifu-t); flex:0 0 8px; }
      .ifu-title-wrap { min-width:0; }
      .ifu-title { font-size:12px; font-weight:600; }
      .ifu-sub { font-size:10px; color:var(--dsw-alias-label-tertiary,#61666b); margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .ifu-icon { width:26px; height:26px; flex:0 0 26px; border:0; border-radius:6px; background:transparent; color:var(--dsw-alias-label-secondary,#3c4043); font:13px/1 var(--dsw-font-family-text,sans-serif); cursor:pointer; }
      .ifu-icon:hover { background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06)); }
      .ifu-icon:focus-visible, .ifu-send:focus-visible, .ifu-chip:focus-visible, .ifu-stage-back:focus-visible, .ifu-stage-action:focus-visible { outline:2px solid var(--dsw-focus-ring-color,#4176e6); outline-offset:2px; }
      .ifu-icon:disabled { opacity:.35; cursor:default; }
      .ifu-icon.ifu-danger { color:var(--dsw-alias-state-error-primary,#ef4444); }
      .ifu-panel-body { flex:1; min-width:0; min-height:0; display:flex; flex-direction:column; overflow:hidden; }
      .ifu-compose-center { flex:1; min-width:0; min-height:0; display:flex; flex-direction:column; overflow-y:auto; overflow-x:hidden; }
      .ifu-compose { box-sizing:border-box; width:100%; max-width:100%; margin:auto 0; padding:11px 12px 0; display:flex; flex-direction:column; min-width:0; min-height:0; }
      .ifu-draft-quote { box-sizing:border-box; width:100%; max-width:100%; margin:auto 0; padding:11px 12px; }
      .ifu-draft-wait { margin-top:10px; font-size:10px; color:var(--dsw-alias-label-caption,#979da6); }
      .ifu-input-panel { display:flex; flex-direction:column; }
      .ifu-input-body { flex:1; min-width:0; min-height:0; display:flex; flex-direction:column; padding:11px 12px 0; overflow:auto; }
      .ifu-input-body .ifu-textarea { flex:1; min-height:52px; resize:none; }
      .ifu-quote { box-sizing:border-box; max-width:100%; border-left:2.5px solid var(--ifu-c); background:var(--ifu-t); border-radius:2px 9px 9px 2px; padding:8px 10px; color:var(--dsw-alias-label-secondary,#3c4043); font-size:11.5px; line-height:1.55; }
      .ifu-quote-label { font-size:9px; color:var(--dsw-alias-label-tertiary,#61666b); margin-bottom:3px; }
      .ifu-quote-text { max-height:88px; overflow:auto; }
      .ifu-textarea { box-sizing:border-box; width:100%; max-width:100%; margin-top:10px; min-height:86px; max-height:180px; resize:vertical; border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.12)); border-radius:10px; background:var(--dsw-alias-bg-base,#fff); color:var(--dsw-alias-label-primary,#0f1115); font:13.5px/1.6 var(--dsw-font-family-text,-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif); padding:9px 10px; }
      .ifu-textarea:focus { outline:2px solid var(--dsw-focus-ring-color,#4176e6); outline-offset:1px; }
      .ifu-error { margin-top:8px; color:var(--dsw-alias-state-error-primary,#ef4444); font-size:10.5px; line-height:1.5; }
      .ifu-compose-foot { display:flex; align-items:center; gap:8px; padding:8px 0 10px; }
      .ifu-hint { font-size:9px; color:var(--dsw-alias-label-caption,#979da6); }
      .ifu-send { height:29px; padding:0 13px; border:0; border-radius:8px; background:var(--dsw-alias-label-primary,#17191d); color:var(--dsw-alias-bg-layer-1,#fff); font:500 12px/1 var(--dsw-font-family-text,sans-serif); cursor:pointer; }
      .ifu-send:disabled { opacity:.55; cursor:default; }
      .ifu-thread-host { display:flex; flex-direction:column; flex:1; min-width:0; min-height:0; width:100%; max-width:100%; height:auto; overflow:hidden; box-sizing:border-box; background:var(--dsw-alias-bg-base,#fff); }
      .ifu-thread { flex:1; min-width:0; min-height:0; width:100%; max-width:100%; display:flex; flex-direction:column; overflow-x:hidden; box-sizing:border-box; }
      .ifu-thread [data-conversation-content], .ifu-thread [data-conversation-scroll] { max-width:100%; box-sizing:border-box; }
      .ifu-thread > * { flex:1; min-height:0; }
      .ifu-loading { padding:28px 16px; color:var(--dsw-alias-label-tertiary,#61666b); font-size:12px; text-align:center; }
      .ifu-stage { position:fixed; top:var(--dsh-frame-top-clearance,0px); left:0; right:0; bottom:0; z-index:300; pointer-events:auto; -webkit-app-region:no-drag; display:flex; flex-direction:column; background:var(--dsw-alias-bg-base,#fff); color:var(--dsw-alias-label-primary,#0f1115); }
      .ifu-stage-bar { pointer-events:auto; position:relative; z-index:12; -webkit-app-region:no-drag; height:56px; flex:0 0 56px; display:flex; align-items:center; gap:8px; padding:0 14px; border-bottom:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.12)); background:var(--dsw-specific-sidebar-fill,#f9fafb); }
      .ifu-stage-back { pointer-events:auto; position:relative; z-index:13; -webkit-app-region:no-drag; height:28px; padding:0 8px; border:0; border-radius:6px; background:transparent; color:var(--dsw-alias-label-secondary,#3c4043); font:11px/1 var(--dsw-font-family-text,sans-serif); cursor:pointer; }
      .ifu-stage-back:hover { background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06)); }
      .ifu-stage-back:disabled { opacity:.35; cursor:default; background:transparent; }
      .ifu-stage-count { font:9px/1 var(--dsw-font-family-code,monospace); color:var(--dsw-alias-label-caption,#979da6); padding:0 5px; }
      .ifu-stage-divider { width:1px; height:18px; background:var(--dsw-alias-border-l2,rgba(0,0,0,.12)); margin:0 2px; }
      .ifu-crumbs { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--dsw-alias-label-tertiary,#61666b); min-width:0; overflow:hidden; white-space:nowrap; }
      .ifu-crumb-sep { color:var(--dsw-alias-label-caption,#979da6); }
      .ifu-crumb-btn { pointer-events:auto; -webkit-app-region:no-drag; border:0; background:transparent; padding:2px 3px; border-radius:4px; color:var(--dsw-alias-label-tertiary,#61666b); font:11px/1.4 var(--dsw-font-family-text,sans-serif); cursor:pointer; }
      .ifu-crumb-btn:hover { background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06)); color:var(--dsw-alias-label-secondary,#3c4043); }
      .ifu-crumb-current { color:var(--dsw-alias-label-primary,#0f1115); font-weight:600; }
      .ifu-crumb-btn.ifu-crumb-current { cursor:default; }
      .ifu-crumb-btn.ifu-crumb-current:hover { background:transparent; }
      .ifu-context-chip { font-size:9.5px; color:var(--dsw-alias-label-tertiary,#61666b); background:var(--dsw-alias-bg-module-platform,#f1f3f5); padding:3px 7px; border-radius:999px; white-space:nowrap; }
      .ifu-stage-status { font-size:9.5px; color:var(--dsw-alias-state-success-primary,#2f8f62); background:var(--dsw-alias-bg-module-platform,#f1f3f5); padding:3px 7px; border-radius:999px; white-space:nowrap; }
      .ifu-stage-action { pointer-events:auto; position:relative; z-index:13; -webkit-app-region:no-drag; height:28px; padding:0 8px; border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.12)); border-radius:6px; background:var(--dsw-alias-bg-layer-1,#fff); color:var(--dsw-alias-label-secondary,#3c4043); font:10px/1 var(--dsw-font-family-text,sans-serif); cursor:pointer; }
      .ifu-stage-action:hover { background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06)); }
      .ifu-stage-tip { position:relative; z-index:11; flex:0 0 30px; display:flex; align-items:center; padding:0 18px; background:var(--dsw-alias-bg-module-platform,#f7f9fc); border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.06)); color:var(--dsw-alias-label-tertiary,#61666b); font-size:10px; }
      .ifu-stage-body { position:relative; z-index:1; flex:1; min-width:0; min-height:0; display:flex; flex-direction:column; overflow-x:hidden; }
      .ifu-stage-quote { flex:0 0 auto; box-sizing:border-box; width:min(calc(100% - 36px), var(--dsh-chat-content-width,760px)); margin:10px auto 0; padding:8px 11px; border:1px solid color-mix(in srgb, var(--ifu-c) 30%, transparent); border-left:3px solid var(--ifu-c); border-radius:8px; background:color-mix(in srgb, var(--ifu-c) 9%, var(--dsw-alias-bg-base,#fff)); color:var(--dsw-alias-label-primary,#0f1115); }
      .ifu-stage-quote-label { display:flex; align-items:center; gap:5px; margin-bottom:4px; font-size:9px; color:var(--dsw-alias-label-tertiary,#61666b); }
      .ifu-stage-quote-label .ifu-dot { flex:0 0 6px; }
      .ifu-stage-quote-text { max-height:150px; overflow:auto; font-size:11px; line-height:1.55; white-space:pre-wrap; word-break:break-word; }
      .ifu-stage-thread { flex:1; min-width:0; min-height:0; height:auto; max-width:100%; overflow-x:hidden; }
      .ifu-stage-thread .ifu-stage-native-quote { display:none !important; }
      .ifu-resize { position:absolute; z-index:6; touch-action:none; }
      .ifu-e { right:-3px; top:0; bottom:0; width:7px; cursor:ew-resize; }
      .ifu-w { left:-3px; top:0; bottom:0; width:7px; cursor:ew-resize; }
      .ifu-n { left:0; right:0; top:-3px; height:7px; cursor:ns-resize; }
      .ifu-s { left:0; right:0; bottom:-3px; height:7px; cursor:ns-resize; }
      .ifu-ne { right:-4px; top:-4px; width:14px; height:14px; cursor:nesw-resize; }
      .ifu-nw { left:-4px; top:-4px; width:14px; height:14px; cursor:nwse-resize; }
      .ifu-se { right:-4px; bottom:-4px; width:16px; height:16px; cursor:nwse-resize; }
      .ifu-sw { left:-4px; bottom:-4px; width:14px; height:14px; cursor:nesw-resize; }
      .ifu-se::after { content:""; position:absolute; right:4px; bottom:4px; width:7px; height:7px; border-right:2px solid var(--dsw-alias-label-caption,#979da6); border-bottom:2px solid var(--dsw-alias-label-caption,#979da6); border-radius:0 0 2px 0; opacity:.6; }
      .ifu-tree { pointer-events:auto; position:absolute; -webkit-app-region:no-drag; top:86px; right:0; bottom:0; z-index:20; width:300px; display:flex; flex-direction:column; background:var(--dsw-specific-sidebar-fill,#fbfbfc); border-left:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.12)); box-shadow:-12px 0 30px rgba(15,17,21,.06); }
      .ifu-tree-head { display:flex; align-items:center; gap:8px; padding:10px 12px; border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.06)); font-size:10px; color:var(--dsw-alias-label-tertiary,#61666b); }
      .ifu-tree-head .ifu-icon { margin-left:0; }
      .ifu-tree-tabs { margin-left:auto; display:flex; gap:2px; padding:1px; border-radius:6px; background:var(--dsw-alias-bg-module-platform,#f1f3f5); }
      .ifu-tree-tab { border:0; border-radius:5px; background:transparent; color:var(--dsw-alias-label-tertiary,#61666b); font:9px/1.4 var(--dsw-font-family-text,sans-serif); padding:3px 6px; cursor:pointer; }
      .ifu-tree-tab.is-active { background:var(--dsw-alias-bg-layer-1,#fff); color:var(--dsw-alias-label-primary,#0f1115); box-shadow:0 1px 2px rgba(0,0,0,.06); }
      .ifu-tree-list { flex:1; min-height:0; overflow:auto; padding:8px; display:flex; flex-direction:column; gap:6px; }
      .ifu-tree-root { display:flex; align-items:center; gap:6px; box-sizing:border-box; padding:8px; border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.06)); border-radius:8px; background:var(--dsw-alias-bg-module-platform,#f1f3f5); cursor:pointer; }
      .ifu-tree-root-name { font-size:10px; color:var(--dsw-alias-label-primary,#0f1115); }
      .ifu-tree-root-tag { margin-left:auto; font:8px/1 var(--dsw-font-family-code,monospace); color:var(--dsw-alias-label-caption,#979da6); }
      .ifu-tree-root-meta { font-size:8px; color:var(--dsw-alias-label-caption,#979da6); }
      .ifu-tree-row { pointer-events:auto; width:100%; box-sizing:border-box; display:flex; flex-direction:column; align-items:stretch; gap:4px; border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.06)); border-radius:8px; background:var(--dsw-alias-bg-layer-1,#fff); padding:8px; color:var(--dsw-alias-label-primary,#0f1115); text-align:left; cursor:pointer; }
      .ifu-tree-row:hover { border-color:color-mix(in srgb, var(--ifu-c) 36%, var(--dsw-alias-border-l2,rgba(0,0,0,.12))); }
      .ifu-tree-row.is-current { border-color:var(--ifu-c); background:color-mix(in srgb, var(--ifu-c) 7%, var(--dsw-alias-bg-layer-1,#fff)); box-shadow:0 1px 3px rgba(0,0,0,.06); }
      .ifu-tree-top { display:flex; align-items:center; gap:6px; min-width:0; }
      .ifu-tree-num { font:600 9px/1 var(--dsw-font-family-code,monospace); color:var(--dsw-alias-label-secondary,#3c4043); flex:0 0 auto; }
      .ifu-tree-title { min-width:0; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:10px; color:var(--dsw-alias-label-primary,#0f1115); }
      .ifu-tree-quote { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-left:6px; border-left:2px solid var(--ifu-c); font-size:9px; color:var(--dsw-alias-label-tertiary,#61666b); }
      .ifu-tree-meta { display:flex; align-items:center; justify-content:space-between; gap:6px; font-size:8px; color:var(--dsw-alias-label-caption,#979da6); }
      .ifu-tree-tag { flex:0 0 auto; margin-left:auto; font-size:7.5px; color:var(--dsw-alias-state-success-primary,#2f8f62); }
      .ifu-tree-tag.is-context { color:var(--ifu-c); }
      .ifu-tree-note { padding:10px 12px; border-top:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.06)); font-size:8.5px; line-height:1.5; color:var(--dsw-alias-label-caption,#979da6); }
      .ifu-badge-layer { position:absolute; inset:0; pointer-events:none; z-index:3; }
      .ifu-badge { position:absolute; z-index:3; pointer-events:auto; display:inline-flex; align-items:center; gap:4px; height:18px; padding:0 5px 0 4px; border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.12)); border-radius:999px; background:var(--dsw-alias-bg-layer-1,#fff); color:var(--dsw-alias-label-tertiary,#61666b); font:600 8.5px/1 var(--dsw-font-family-code,monospace); box-shadow:0 2px 6px rgba(15,17,21,.08); cursor:pointer; }
      .ifu-badge .ifu-dot { width:6px; height:6px; box-shadow:none; }
      .ifu-dock { position:fixed; -webkit-app-region:no-drag; right:18px; bottom:96px; z-index:80; width:286px; height:260px; min-width:220px; min-height:120px; max-width:calc(100vw - 16px); max-height:calc(100vh - 16px); pointer-events:auto; display:flex; flex-direction:column; overflow:hidden; border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.12)); border-radius:12px; background:var(--dsw-alias-bg-layer-1,#fff); color:var(--dsw-alias-label-primary,#0f1115); box-shadow:0 12px 32px rgba(15,17,21,.12); }
      .ifu-dock-head { display:flex; align-items:center; gap:6px; padding:8px 10px; border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.06)); font-size:9.5px; color:var(--dsw-alias-label-tertiary,#61666b); cursor:grab; user-select:none; }
      .ifu-dock-head:active { cursor:grabbing; }
      .ifu-dock-toggle { margin-left:auto; border:0; background:transparent; color:var(--dsw-alias-label-tertiary,#61666b); cursor:pointer; font-size:13px; line-height:1; }
      .ifu-dock-list { flex:1; min-height:0; overflow:auto; padding:4px; }
      .ifu-dock-row { width:100%; box-sizing:border-box; display:flex; align-items:center; gap:6px; border:0; border-radius:7px; background:transparent; padding:6px 7px; color:var(--dsw-alias-label-primary,#0f1115); text-align:left; cursor:pointer; }
      .ifu-dock-row:hover, .ifu-dock-row.is-open { background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06)); }
      .ifu-dock-num { font:600 9.5px/1 var(--dsw-font-family-code,monospace); color:var(--dsw-alias-label-secondary,#3c4043); flex:0 0 auto; }
      .ifu-dock-text { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:10px; color:var(--dsw-alias-label-tertiary,#61666b); }
      .ifu-dock-status { margin-left:auto; font-size:8px; color:var(--dsw-alias-label-caption,#979da6); flex:0 0 auto; }
      .ifu-dock-delete, .ifu-tree-delete { width:20px; height:20px; flex:0 0 20px; border:0; border-radius:5px; background:transparent; color:var(--dsw-alias-state-error-primary,#ef4444); font:12px/1 var(--dsw-font-family-text,sans-serif); cursor:pointer; }
      .ifu-dock-delete:hover, .ifu-tree-delete:hover { background:color-mix(in srgb, var(--dsw-alias-state-error-primary,#ef4444) 12%, transparent); }
      .ifu-tree-delete { margin-left:auto; }
      .ifu-dock-collapsed { position:fixed; right:18px; bottom:96px; z-index:80; pointer-events:auto; height:26px; padding:0 9px; border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,.12)); border-radius:999px; background:var(--dsw-alias-bg-layer-1,#fff); color:var(--dsw-alias-label-secondary,#3c4043); font-size:9.5px; box-shadow:0 6px 18px rgba(15,17,21,.1); cursor:pointer; }
      .ifu-notice { position:fixed; left:50%; bottom:22px; transform:translateX(-50%); z-index:500; pointer-events:none; max-width:min(520px,80vw); padding:8px 13px; border-radius:9px; background:var(--dsw-alias-hovercard-bg,#353A40); color:var(--dsw-alias-hovercard-label-primary,#fff); font-size:11px; box-shadow:0 10px 28px rgba(0,0,0,.2); }
      .ifu-root, .ifu-panel, .ifu-stage, .ifu-dock, .ifu-chip { font-family:var(--dsw-font-family-text,-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif); }
      html[data-fullscreen] .ifu-stage { top:0; }
      @media (max-width: 760px) {
        .ifu-panel { left:12px !important; right:12px; width:auto; top:12px !important; max-height:78vh; }
        .ifu-dock { right:12px; bottom:84px; width:calc(100vw - 24px); }
        .ifu-stage-bar { gap:4px; padding:0 8px; }
        .ifu-context-chip { display:none; }
      }
    `

    // ---------------------------------------------------------------------
    // plugin entry
    // ---------------------------------------------------------------------

    return {
      name: 'inline-followup',
      inject: ['slots', 'locale', 'sessions'],
      apply(ctx) {
        app = createApp(ctx)
        app.load()
        ctx.effect(() => ctx.locale.register(NS, DICT), 'inline-followup: locale')
        ctx.effect(() => ctx.on('locale/change', () => app.emit()), 'inline-followup: locale-change')
        ctx.effect(() => app.install(), 'inline-followup: lifetime')
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'inline-followup',
          children: {
            'followup.thread': { kind: 'single', scope: 'session' },
          },
        }, FollowupLayer))
        ctx.slots.inject('followup.thread', () => ctx.slots.register({
          name: 'followup.thread',
        }, FollowupThread))
        ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
          name: 'conversation.session.header.utilities',
          id: 'inline-followup-probe',
          order: 40,
        }, SessionProbe))
      },
    }
  },
})
