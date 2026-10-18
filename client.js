window.__ModuleLoader__.load({
  id: 'dsh-plugin-prompt',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Identity shared by the sidebar entry, the main panel, and the composer seats. */
    const PANEL_ID = 'prompt-library'
    /** Locale namespace owned by this plugin. */
    const NS = 'prompt-library'
    /** Browser-local storage key for user-authored templates. */
    const STORAGE_KEY = 'dsh.prompt-library.templates.v1'
    /** Browser-local storage key for categories that exist before they have templates. */
    const CATEGORY_STORAGE_KEY = 'dsh.prompt-library.categories.v1'
    /** Built-in category ids whose localized labels double as built-in categories. */
    const BUILTIN_CATEGORY_IDS = ['coding', 'writing', 'general']
    /** How long a pending cross-panel insertion stays eligible. */
    const PENDING_TTL = 8000

    // #region Locale dictionaries -------------------------------------------------

    const EN = {
      'panel.label': 'Prompt Library',
      'page.title': 'Prompt Library',
      'page.subtitle':
        'Pick a template to insert into the composer, or keep your own collection. With no conversation open, choosing a template starts a new one.',
      'action.create': 'New template',
      'action.save': 'Save',
      'action.cancel': 'Cancel',
      'action.insert': 'Insert',
      'action.copy': 'Copy',
      'action.edit': 'Edit',
      'action.delete': 'Delete',
      'action.confirmDelete': 'Delete',
      'action.duplicate': 'Save as mine',
      'action.manage': 'Manage library',
      'action.back': 'Back to conversation',
      'search.placeholder': 'Search title, text, or category',
      'search.clear': 'Clear search',
      'filter.all': 'All',
      'section.builtin': 'Built-in templates',
      'section.mine': 'My templates',
      'section.mineHint': 'Saved in this browser',
      'empty.mine': 'No templates of your own yet. Create one, or save a built-in template as an editable copy.',
      'empty.search': 'No templates match your search.',
      'count': '{count} templates',
      'badge.builtin': 'Built-in',
      'badge.mine': 'Mine',
      'badge.uncategorized': 'Uncategorized',
      'category.add': 'New category',
      'dialog.category': 'New category',
      'form.categoryRequired': 'Enter a category name.',
      'empty.category': 'No templates in this category yet.',
      'action.createInCategory': 'New template in this category',
      'notice.categoryAdded': 'Category created',
      'notice.categoryExists': 'That category already exists; it has been selected.',
      'composer.trigger': 'Prompt templates',
      'composer.title': 'Insert a template',
      'composer.search': 'Search templates',
      'composer.empty': 'No templates match your search.',
      'notice.inserted': 'Template inserted',
      'notice.insertFailed': 'Could not insert the template. Try again.',
      'notice.copied': 'Copied to the clipboard',
      'notice.copyFailed': 'Could not copy to the clipboard',
      'confirm.delete': 'Delete this template? This cannot be undone.',
      'dialog.create': 'New template',
      'dialog.edit': 'Edit template',
      'form.title': 'Title',
      'form.titlePlaceholder': 'For example: Code review',
      'form.category': 'Category',
      'form.categoryPlaceholder': 'For example: Engineering',
      'form.body': 'Template',
      'form.bodyPlaceholder': 'Write the prompt text to insert into the composer…',
      'form.required': 'A title and template text are required.',
      'form.hint': '⌘/Ctrl + Enter to save',
      'duplicate.title': '{title} (copy)',
      'category.coding': 'Engineering',
      'category.writing': 'Writing',
      'category.general': 'General',
      'category.uncategorized': 'Uncategorized',
      'builtin.review.title': 'Code review',
      'builtin.review.body':
        'Review the following code for correctness, edge cases, performance, security, and maintainability. List the issues by severity first, then give concrete suggestions:\n\n',
      'builtin.refactor.title': 'Refactor',
      'builtin.refactor.body':
        'Refactor the following code without changing its external behavior. Remove duplication, simplify complex logic, and explain each change:\n\n',
      'builtin.tests.title': 'Write tests',
      'builtin.tests.body':
        'Write tests for the following code, covering the main paths, edge cases, and error branches. Explain the test strategy first, then provide complete runnable tests:\n\n',
      'builtin.debug.title': 'Debug an issue',
      'builtin.debug.body':
        'Help me debug the following issue. List the most likely root-cause hypotheses, describe how to verify each one, and then propose a fix:\n\nProblem:\n\nRelevant code or error:\n\n',
      'builtin.explain.title': 'Explain code',
      'builtin.explain.body':
        'Explain the following code section by section: what it does, its key data structures, the execution flow, and any risks or improvement points:\n\n',
      'builtin.summarize.title': 'Summarize',
      'builtin.summarize.body':
        'Summarize the following content: start with a one-sentence conclusion, then list the key points, and finally note important details or open questions:\n\n',
      'builtin.translate.title': 'Translate',
      'builtin.translate.body':
        'Translate the following content into Chinese, preserving the original formatting, tone, and technical terms. Note any ambiguities:\n\n',
      'builtin.research.title': 'Structured research',
      'builtin.research.body':
        'Research the following topic in a structured way: start with the background and key questions, compare the main approaches or viewpoints and their trade-offs, and finish with actionable recommendations and further reading:\n\n',
    }

    const ZH = {
      'panel.label': '提示词模板库',
      'page.title': '提示词模板库',
      'page.subtitle':
        '选择模板插入当前输入框，或维护自己的模板集合。没有打开的对话时，选择模板会新建一个对话。',
      'action.create': '新建模板',
      'action.save': '保存',
      'action.cancel': '取消',
      'action.insert': '插入',
      'action.copy': '复制',
      'action.edit': '编辑',
      'action.delete': '删除',
      'action.confirmDelete': '删除',
      'action.duplicate': '另存为我的模板',
      'action.manage': '管理模板库',
      'action.back': '返回对话',
      'search.placeholder': '搜索标题、内容或分类',
      'search.clear': '清除搜索',
      'filter.all': '全部',
      'section.builtin': '内置模板',
      'section.mine': '我的模板',
      'section.mineHint': '保存在当前浏览器',
      'empty.mine': '还没有自己的模板。新建一个，或把内置模板另存为可编辑副本。',
      'empty.search': '没有匹配的模板。',
      'count': '共 {count} 个模板',
      'badge.builtin': '内置',
      'badge.mine': '我的',
      'badge.uncategorized': '未分类',
      'category.add': '新建分类',
      'dialog.category': '新建分类',
      'form.categoryRequired': '请输入分类名称。',
      'empty.category': '这个分类还没有模板。',
      'action.createInCategory': '在此分类下新建模板',
      'notice.categoryAdded': '分类已创建',
      'notice.categoryExists': '该分类已存在，已为你选中。',
      'composer.trigger': '提示词模板',
      'composer.title': '插入模板',
      'composer.search': '搜索模板',
      'composer.empty': '没有匹配的模板。',
      'notice.inserted': '模板已插入',
      'notice.insertFailed': '模板插入失败，请重试。',
      'notice.copied': '已复制到剪贴板',
      'notice.copyFailed': '复制失败',
      'confirm.delete': '删除这个模板？此操作无法撤销。',
      'dialog.create': '新建模板',
      'dialog.edit': '编辑模板',
      'form.title': '标题',
      'form.titlePlaceholder': '例如：代码审查',
      'form.category': '分类',
      'form.categoryPlaceholder': '例如：编程开发',
      'form.body': '模板内容',
      'form.bodyPlaceholder': '输入要插入到输入框的提示词…',
      'form.required': '请填写标题和模板内容。',
      'form.hint': '⌘/Ctrl + Enter 保存',
      'duplicate.title': '{title}（副本）',
      'category.coding': '编程开发',
      'category.writing': '写作表达',
      'category.general': '通用',
      'category.uncategorized': '未分类',
      'builtin.review.title': '代码审查',
      'builtin.review.body':
        '请审查以下代码，重点关注正确性、边界条件、性能、安全性和可维护性。先按严重程度列出问题，再给出具体的修改建议：\n\n',
      'builtin.refactor.title': '重构代码',
      'builtin.refactor.body':
        '请在不改变外部行为的前提下重构以下代码，消除重复、简化复杂逻辑，并说明每一处改动的理由：\n\n',
      'builtin.tests.title': '编写测试',
      'builtin.tests.body':
        '请为以下代码编写测试，覆盖主要路径、边界条件和错误分支。先说明测试策略，再给出完整可运行的测试代码：\n\n',
      'builtin.debug.title': '排查问题',
      'builtin.debug.body':
        '请帮我排查以下问题。先列出最可能的根因假设，再给出验证每一步假设的具体方法，最后提供修复方案：\n\n问题描述：\n\n相关代码或报错：\n\n',
      'builtin.explain.title': '解释代码',
      'builtin.explain.body':
        '请逐段解释以下代码的作用、关键数据结构和执行流程，并指出潜在风险和改进点：\n\n',
      'builtin.summarize.title': '总结内容',
      'builtin.summarize.body':
        '请总结以下内容：先给出一句话结论，再列出关键要点，最后补充值得注意的细节或疑问：\n\n',
      'builtin.translate.title': '翻译润色',
      'builtin.translate.body':
        '请把以下内容翻译成英文，保持原有格式、语气和专业术语；如有歧义，请注明：\n\n',
      'builtin.research.title': '结构化调研',
      'builtin.research.body':
        '请围绕以下主题做一次结构化调研：先给出背景和关键问题，再比较主要方案或观点及其权衡，最后给出可执行的建议和延伸阅读方向：\n\n',
    }

    // #endregion

    // #region Templates and persistence ------------------------------------------

    /** Built-in templates. Their text lives in the locale dictionaries so it follows the UI language. */
    const BUILTINS = [
      { id: 'review', category: 'coding' },
      { id: 'refactor', category: 'coding' },
      { id: 'tests', category: 'coding' },
      { id: 'debug', category: 'coding' },
      { id: 'explain', category: 'coding' },
      { id: 'summarize', category: 'writing' },
      { id: 'translate', category: 'writing' },
      { id: 'research', category: 'general' },
    ]

    function newId() {
      try {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
          return `tpl-${window.crypto.randomUUID()}`
        }
      } catch (_unavailable) {
        /* fall through to the timestamp form */
      }
      return `tpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    }

    function normalizeTemplate(value) {
      if (value === null || typeof value !== 'object') return null
      const title = typeof value.title === 'string' ? value.title.trim() : ''
      const body = typeof value.body === 'string' ? value.body : ''
      if (title === '' || body.trim() === '') return null
      const category = typeof value.category === 'string' ? value.category.trim() : ''
      const id = typeof value.id === 'string' && value.id !== '' ? value.id : newId()
      const updatedAt = typeof value.updatedAt === 'number' ? value.updatedAt : Date.now()
      return { id, title, body, category, updatedAt }
    }

    function loadTemplates() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw === null) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed.map(normalizeTemplate).filter((item) => item !== null)
      } catch (error) {
        console.error('prompt-library: could not read saved templates', error)
        return []
      }
    }

    function persistTemplates(next) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch (error) {
        console.error('prompt-library: could not save templates', error)
      }
    }

    let userTemplates = loadTemplates()
    const templateListeners = new Set()

    function normalizeCategory(value) {
      return typeof value === 'string' ? value.trim() : ''
    }

    function loadCategories() {
      try {
        const raw = window.localStorage.getItem(CATEGORY_STORAGE_KEY)
        if (raw === null) return null
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        const seen = new Set()
        const categories = []
        for (const value of parsed) {
          const name = normalizeCategory(value)
          if (name === '') continue
          const key = name.toLowerCase()
          if (seen.has(key)) continue
          seen.add(key)
          categories.push(name)
        }
        return categories
      } catch (error) {
        console.error('prompt-library: could not read saved categories', error)
        return []
      }
    }

    function persistCategories(next) {
      try {
        window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(next))
      } catch (error) {
        console.error('prompt-library: could not save categories', error)
      }
    }

    const storedCategories = loadCategories()
    let userCategories = storedCategories === null ? [] : storedCategories
    const categoryListeners = new Set()

    function subscribeCategories(listener) {
      categoryListeners.add(listener)
      return () => {
        categoryListeners.delete(listener)
      }
    }

    function getCategoriesSnapshot() {
      return userCategories
    }

    function setUserCategories(next) {
      userCategories = next
      persistCategories(next)
      for (const listener of [...categoryListeners]) listener()
    }

    if (storedCategories === null) {
      const seed = []
      for (const template of userTemplates) {
        const name = template.category.trim()
        if (name !== '' && !seed.some((entry) => entry.toLowerCase() === name.toLowerCase())) seed.push(name)
      }
      if (seed.length > 0) {
        userCategories = seed
        persistCategories(seed)
      }
    }

    function subscribeTemplates(listener) {
      templateListeners.add(listener)
      return () => {
        templateListeners.delete(listener)
      }
    }

    function getTemplatesSnapshot() {
      return userTemplates
    }

    function setUserTemplates(next) {
      userTemplates = next
      persistTemplates(next)
      for (const listener of [...templateListeners]) listener()
    }

    function createTemplate(input) {
      const template = {
        id: newId(),
        title: input.title,
        body: input.body,
        category: input.category,
        updatedAt: Date.now(),
      }
      setUserTemplates([template, ...userTemplates])
    }

    function updateTemplate(id, patch) {
      setUserTemplates(
        userTemplates.map((template) =>
          template.id === id ? { ...template, ...patch, updatedAt: Date.now() } : template,
        ),
      )
    }

    function deleteTemplate(id) {
      setUserTemplates(userTemplates.filter((template) => template.id !== id))
    }

    function builtinCategoryForLabel(label, t) {
      const needle = label.trim().toLowerCase()
      if (needle === '') return null
      for (const id of BUILTIN_CATEGORY_IDS) {
        if (t(`category.${id}`).toLowerCase() === needle) return id
      }
      return null
    }

    function resolveUserCategory(rawCategory, t) {
      const name = rawCategory.trim()
      if (name === '') return { key: 'user:', label: t('category.uncategorized') }
      const builtin = builtinCategoryForLabel(name, t)
      if (builtin !== null) return { key: `builtin:${builtin}`, label: t(`category.${builtin}`) }
      return { key: `user:${name}`, label: name }
    }

    function ensureUserCategory(name, t) {
      const trimmed = name.trim()
      if (trimmed === '') return null
      const builtin = builtinCategoryForLabel(trimmed, t)
      if (builtin !== null) return `builtin:${builtin}`
      const existing = userCategories.find((entry) => entry.toLowerCase() === trimmed.toLowerCase())
      if (existing !== undefined) return `user:${existing}`
      setUserCategories([...userCategories, trimmed])
      return `user:${trimmed}`
    }

    /**
     * Merge built-ins and user templates into the display model.
     * Category keys are prefixed to keep a user category that happens to be named
     * "coding" separate from the built-in Engineering category.
     */
    function buildItems(t) {
      const items = []
      for (const builtin of BUILTINS) {
        items.push({
          id: `builtin:${builtin.id}`,
          builtin: true,
          title: t(`builtin.${builtin.id}.title`),
          body: t(`builtin.${builtin.id}.body`),
          categoryKey: `builtin:${builtin.category}`,
          categoryLabel: t(`category.${builtin.category}`),
          rawCategory: '',
        })
      }
      const ordered = [...userTemplates].sort((left, right) => right.updatedAt - left.updatedAt)
      for (const template of ordered) {
        const category = resolveUserCategory(template.category, t)
        items.push({
          id: template.id,
          builtin: false,
          title: template.title,
          body: template.body,
          categoryKey: category.key,
          categoryLabel: category.label,
          rawCategory: template.category,
        })
      }
      return items
    }

    function filterItems(items, query, categoryKey) {
      const needle = query.trim().toLowerCase()
      return items.filter((item) => {
        if (categoryKey !== 'all' && item.categoryKey !== categoryKey) return false
        if (needle === '') return true
        return (
          item.title.toLowerCase().includes(needle) ||
          item.body.toLowerCase().includes(needle) ||
          item.categoryLabel.toLowerCase().includes(needle)
        )
      })
    }

    function categoriesOf(items, explicitCategories, t) {
      const seen = new Map()
      for (const item of items) {
        if (!seen.has(item.categoryKey)) seen.set(item.categoryKey, item.categoryLabel)
      }
      for (const name of explicitCategories) {
        if (name.trim() === '') continue
        if (builtinCategoryForLabel(name, t) !== null) continue
        const key = `user:${name}`
        if (!seen.has(key)) seen.set(key, name)
      }
      return [...seen].map(([key, label]) => ({ key, label })).sort((left, right) => left.label.localeCompare(right.label))
    }

    // #endregion

    // #region Composer picker and pending insertion ------------------------------

    let pickerOpen = false
    const pickerListeners = new Set()

    function subscribePicker(listener) {
      pickerListeners.add(listener)
      return () => {
        pickerListeners.delete(listener)
      }
    }

    function getPickerSnapshot() {
      return pickerOpen
    }

    function setPickerOpen(next) {
      if (pickerOpen === next) return
      pickerOpen = next
      for (const listener of [...pickerListeners]) listener()
    }

    function togglePicker() {
      setPickerOpen(!pickerOpen)
    }

    let pendingInsertion = null
    let insertionNonce = 0
    const insertionListeners = new Set()

    function subscribeInsertion(listener) {
      insertionListeners.add(listener)
      return () => {
        insertionListeners.delete(listener)
      }
    }

    function notifyInsertion() {
      for (const listener of [...insertionListeners]) listener()
    }

    /** Queue a template body for the mounted composer; it inserts once the composer is reachable. */
    function requestInsertion(text) {
      if (typeof text !== 'string' || text === '') return
      pendingInsertion = { text, at: Date.now(), nonce: (insertionNonce += 1), retried: false }
      notifyInsertion()
    }

    function clearInsertion(nonce) {
      if (pendingInsertion !== null && pendingInsertion.nonce === nonce) {
        pendingInsertion = null
        notifyInsertion()
      }
    }

    // #endregion

    // #region Icons ---------------------------------------------------------------

    function TemplateIcon({ size = 16 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('path', { d: 'M6.5 4.25h11a1.75 1.75 0 0 1 1.75 1.75v14.5l-7.25-4.35L4.75 20.5V6A1.75 1.75 0 0 1 6.5 4.25Z' }),
        h('path', { d: 'M9.25 8.5h5.5M9.25 12h3.75' }),
      )
    }

    function SearchIcon({ size = 14 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('circle', { cx: 11, cy: 11, r: 6.5 }),
        h('path', { d: 'm16 16 4.5 4.5' }),
      )
    }

    function PlusIcon({ size = 14 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.9,
          strokeLinecap: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('path', { d: 'M12 5v14M5 12h14' }),
      )
    }

    function ArrowLeftIcon({ size = 16 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('path', { d: 'M19 12H5M11 6l-6 6 6 6' }),
      )
    }

    function CloseIcon({ size = 12 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 2,
          strokeLinecap: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('path', { d: 'M6 6l12 12M18 6 6 18' }),
      )
    }

    /** Decorative sidebar glyph; the sidebar owns the button label and accessible name. */
    function PromptLibraryIcon({ size = 16 }) {
      return h(TemplateIcon, { size })
    }

    // #endregion

    // #region Styles --------------------------------------------------------------

    const PAGE_CSS = `
.dsh-pl-page{width:100%;min-width:0;height:100%;min-height:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font-size:14px;line-height:1.6;display:flex;overflow:hidden}
.dsh-pl-scroll{scrollbar-gutter:stable;--dsh-scrollbar-width:9px;--dsh-scrollbar-thumb-border:2px;flex:1;min-height:0;overflow:auto}
.dsh-pl-content{max-width:960px;margin:0 auto;padding:0 clamp(24px,4vw,48px) 56px}
.dsh-pl-heading{flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:16px;padding-top:28px;display:flex}
[data-platform="darwin"] .dsh-pl-heading{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.dsh-pl-heading-text{min-width:0}
.dsh-pl-heading h1{flex:0 auto;min-width:0;max-width:100%;margin:0;font-size:20px;font-weight:500;line-height:28px}
.dsh-pl-subtitle{max-width:640px;margin:4px 0 0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.dsh-pl-heading-actions{white-space:nowrap;flex:none;align-items:center;gap:8px;display:flex}
.dsh-pl-btn{appearance:none;box-sizing:border-box;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:5px 10px;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:background-color .12s ease,border-color .12s ease,color .12s ease}
.dsh-pl-btn:hover{background:var(--dsw-alias-bg-layer-2)}
.dsh-pl-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-pl-btn:disabled{opacity:.5;cursor:default}
.dsh-pl-btn-primary{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);border-color:transparent}
.dsh-pl-btn-primary:hover{background:var(--dsw-alias-brand-primary);filter:brightness(.95)}
.dsh-pl-btn-outline{border-color:var(--dsw-alias-border-l1)}
.dsh-pl-btn-danger{color:var(--dsw-alias-state-error-primary)}
.dsh-pl-btn-sm{padding:3px 8px;font-size:12.5px;line-height:18px}
.dsh-pl-icon-btn{appearance:none;box-sizing:border-box;width:30px;height:30px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .12s ease,color .12s ease}
.dsh-pl-icon-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-pl-icon-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-pl-notice{margin:16px 0 -4px;padding:8px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:12.5px;line-height:18px}
.dsh-pl-notice[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}
.dsh-pl-toolbar{flex-wrap:wrap;align-items:center;gap:12px;margin:20px 0 24px;display:flex}
.dsh-pl-search{position:relative;flex:1 1 240px;min-width:200px;max-width:340px}
.dsh-pl-search>svg{position:absolute;left:9px;top:50%;color:var(--dsw-alias-label-secondary);pointer-events:none;transform:translateY(-50%)}
.dsh-pl-search input{box-sizing:border-box;width:100%;height:32px;padding:0 30px 0 30px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;transition:border-color .12s ease}
.dsh-pl-search input::placeholder{color:var(--dsw-alias-label-secondary);opacity:1}
.dsh-pl-search input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsh-pl-search input[type="search"]::-webkit-search-cancel-button{display:none}
.dsh-pl-search-clear{position:absolute;right:4px;top:50%;width:24px;height:24px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transform:translateY(-50%)}
.dsh-pl-search-clear:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-pl-chips{flex-wrap:wrap;align-items:center;gap:4px;display:flex}
.dsh-pl-chip{appearance:none;border:1px solid transparent;border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;padding:3px 10px;cursor:pointer;transition:background-color .12s ease,color .12s ease,border-color .12s ease}
.dsh-pl-chip:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-pl-chip[data-active="true"]{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary)}
.dsh-pl-chip:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-pl-chip-add{display:inline-flex;align-items:center;gap:4px;border-style:dashed;border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}
.dsh-pl-chip-add:hover{border-color:var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-pl-count{margin-left:auto;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsh-pl-section{margin-top:26px}
.dsh-pl-section:first-of-type{margin-top:0}
.dsh-pl-section-head{flex-wrap:wrap;align-items:baseline;gap:8px;margin-bottom:12px;display:flex}
.dsh-pl-section-head h2{margin:0;font-size:13px;font-weight:600;line-height:20px;color:var(--dsw-alias-label-secondary)}
.dsh-pl-section-count{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsh-pl-section-hint{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsh-pl-grid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;display:grid}
.dsh-pl-card{min-width:0;padding:14px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);display:flex;flex-direction:column;gap:8px;transition:border-color .12s ease}
.dsh-pl-card:hover{border-color:var(--dsw-alias-border-l2)}
.dsh-pl-card-head{align-items:flex-start;justify-content:space-between;gap:8px;display:flex}
.dsh-pl-card-title{min-width:0;margin:0;font-size:14px;font-weight:500;line-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-pl-badge{flex:none;padding:1px 7px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;white-space:nowrap}
.dsh-pl-preview{min-height:58px;margin:0;color:var(--dsw-alias-label-secondary);font-size:12.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.dsh-pl-card-actions{flex-wrap:wrap;align-items:center;gap:2px;margin-top:auto;display:flex}
.dsh-pl-confirm-text{flex:1 1 100%;margin-bottom:4px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsh-pl-empty{text-align:center;padding:30px 20px;border:1px dashed var(--dsw-alias-border-l2);border-radius:12px;color:var(--dsw-alias-label-secondary)}
.dsh-pl-empty-title{margin:0;font-size:13px;font-weight:500;line-height:20px;color:var(--dsw-alias-label-primary)}
.dsh-pl-empty-body{max-width:520px;margin:6px auto 0;font-size:12.5px;line-height:19px}
.dsh-pl-empty-action{margin-top:12px}
.dsh-pl-backdrop{position:fixed;inset:0;z-index:1000;padding:24px;background:rgba(0,0,0,.36);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)}
.dsh-pl-dialog{box-sizing:border-box;width:min(680px,calc(100vw - 48px));max-height:calc(100vh - 48px);padding:22px;border:1px solid var(--dsw-alias-border-l1);border-radius:16px;background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-elevation-prominent,0 18px 48px rgba(0,0,0,.24));display:flex;flex-direction:column;gap:14px;overflow:auto}
.dsh-pl-dialog-title{margin:0;font-size:17px;font-weight:500;line-height:24px}
.dsh-pl-dialog-sm{width:min(440px,calc(100vw - 48px))}
.dsh-pl-field{display:flex;flex-direction:column;gap:6px}
.dsh-pl-field label{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px}
.dsh-pl-field input,.dsh-pl-field textarea{box-sizing:border-box;width:100%;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:7px 10px;transition:border-color .12s ease}
.dsh-pl-field input:focus,.dsh-pl-field textarea:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsh-pl-field textarea{min-height:220px;max-height:50vh;resize:vertical;line-height:1.6}
.dsh-pl-form-error{margin:0;color:var(--dsw-alias-state-error-primary);font-size:12.5px;line-height:18px}
.dsh-pl-dialog-foot{flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;display:flex}
.dsh-pl-hint{color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:18px}
.dsh-pl-dialog-actions{gap:6px;display:flex}
@media (max-width:640px){.dsh-pl-grid{grid-template-columns:1fr}.dsh-pl-count{margin-left:0}.dsh-pl-heading-actions{width:100%;justify-content:flex-end}}
@media (prefers-reduced-motion:reduce){.dsh-pl-page *{transition:none!important}}
`

    const PICKER_CSS = `
.dsh-pl-trigger-btn{appearance:none;box-sizing:border-box;width:28px;height:28px;padding:0;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .12s ease,color .12s ease}
.dsh-pl-trigger-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-pl-trigger-btn[aria-expanded="true"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-pl-trigger-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-pl-pop{position:absolute;bottom:calc(100% + 6px);left:0;z-index:100;box-sizing:border-box;width:min(380px,100%);max-height:min(430px,calc(100vh - 170px));border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-overlay);box-shadow:var(--dsw-elevation-prominent,0 16px 40px rgba(0,0,0,.2));display:flex;flex-direction:column;overflow:hidden}
.dsh-pl-pop-backdrop{position:fixed;inset:0;z-index:1000;padding:24px;background:rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)}
.dsh-pl-pop-modal{position:relative;bottom:auto;left:auto;width:min(520px,calc(100vw - 48px));max-height:min(560px,calc(100vh - 96px));box-shadow:var(--dsw-elevation-prominent,0 24px 64px rgba(0,0,0,.28))}
.dsh-pl-pop-head{flex:none;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dsh-pl-pop-title{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:600;line-height:18px}
.dsh-pl-pop-search{position:relative;margin-top:8px}
.dsh-pl-pop-search>svg{position:absolute;left:9px;top:50%;color:var(--dsw-alias-label-secondary);pointer-events:none;transform:translateY(-50%)}
.dsh-pl-pop-search input{box-sizing:border-box;width:100%;height:30px;padding:0 10px 0 30px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;line-height:18px}
.dsh-pl-pop-search input::placeholder{color:var(--dsw-alias-label-secondary);opacity:1}
.dsh-pl-pop-search input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsh-pl-pop-list{flex:1;min-height:0;padding:6px;overflow:auto;scrollbar-gutter:stable}
.dsh-pl-pop-item{appearance:none;box-sizing:border-box;width:100%;padding:7px 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);text-align:left;display:flex;flex-direction:column;gap:1px;cursor:pointer}
.dsh-pl-pop-item:hover,.dsh-pl-pop-item[data-active="true"]{background:var(--dsw-alias-bg-layer-2)}
.dsh-pl-pop-item:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.dsh-pl-pop-item-title{font-size:13px;line-height:19px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-pl-pop-item-meta{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-pl-pop-empty{padding:22px 12px;color:var(--dsw-alias-label-secondary);font-size:12.5px;text-align:center}
.dsh-pl-pop-error{padding:6px 12px;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;border-top:1px solid var(--dsw-alias-border-l1)}
.dsh-pl-pop-flash{padding:6px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsh-pl-pop-flash[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}
.dsh-pl-pop-foot{flex:none;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;border-top:1px solid var(--dsw-alias-border-l1);display:flex;color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:18px}
.dsh-pl-pop-manage{appearance:none;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-brand-primary);font:inherit;font-size:11.5px;line-height:18px;padding:2px 5px;cursor:pointer}
.dsh-pl-pop-manage:hover{background:var(--dsw-alias-bg-layer-2)}
.dsh-pl-pop-manage:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dsh-pl-flash{position:absolute;bottom:calc(100% + 8px);left:12px;z-index:99;box-sizing:border-box;max-width:min(360px,calc(100vw - 32px));padding:6px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-overlay);box-shadow:var(--dsw-elevation-prominent,0 12px 32px rgba(0,0,0,.18));color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px}
.dsh-pl-flash[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}
.dsh-pl-flash-fixed{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:1001}
@media (prefers-reduced-motion:reduce){.dsh-pl-trigger-btn{transition:none!important}}
`

    // #endregion

    // #region Components ----------------------------------------------------------

    function TemplateCard({ item, t, confirming, onInsert, onCopy, onDuplicate, onEdit, onAskDelete, onDelete, onCancelDelete }) {
      return h(
        'article',
        { className: 'dsh-pl-card' },
        h(
          'div',
          { className: 'dsh-pl-card-head' },
          h('h3', { className: 'dsh-pl-card-title', title: item.title }, item.title),
          item.categoryLabel ? h('span', { className: 'dsh-pl-badge' }, item.categoryLabel) : null,
        ),
        h('p', { className: 'dsh-pl-preview', title: item.body }, item.body),
        confirming
          ? h(
              'div',
              { className: 'dsh-pl-card-actions' },
              h('span', { className: 'dsh-pl-confirm-text' }, t('confirm.delete')),
              h(
                'button',
                { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-sm dsh-pl-btn-danger', onClick: onDelete },
                t('action.confirmDelete'),
              ),
              h('button', { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-sm', onClick: onCancelDelete }, t('action.cancel')),
            )
          : h(
              'div',
              { className: 'dsh-pl-card-actions' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-pl-btn dsh-pl-btn-sm dsh-pl-btn-primary',
                  onClick: onInsert,
                },
                t('action.insert'),
              ),
              h('button', { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-sm', onClick: onCopy }, t('action.copy')),
              item.builtin
                ? h(
                    'button',
                    { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-sm', onClick: onDuplicate },
                    t('action.duplicate'),
                  )
                : h('button', { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-sm', onClick: onEdit }, t('action.edit')),
              item.builtin
                ? null
                : h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-pl-btn dsh-pl-btn-sm dsh-pl-btn-danger',
                      onClick: onAskDelete,
                    },
                    t('action.delete'),
                  ),
            ),
      )
    }

    function EditorDialog({ t, editor, categories, onChange, onSave, onClose }) {
      const dialogRef = React.useRef(null)
      const titleRef = React.useRef(null)

      React.useEffect(() => {
        const previous = document.activeElement
        const input = titleRef.current
        if (input !== null && typeof input.focus === 'function') {
          input.focus()
          if (typeof input.select === 'function') input.select()
        }
        return () => {
          if (previous !== null && typeof previous.focus === 'function') previous.focus()
        }
      }, [])

      const onKeyDown = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          onClose()
          return
        }
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault()
          onSave()
          return
        }
        if (event.key !== 'Tab') return
        const dialog = dialogRef.current
        if (dialog === null) return
        const nodes = dialog.querySelectorAll('button, input, textarea, [href], [tabindex]:not([tabindex="-1"])')
        const focusable = [...nodes].filter((node) => !node.disabled && node.offsetParent !== null)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }

      return h(
        'div',
        {
          className: 'dsh-pl-backdrop',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) onClose()
          },
        },
        h(
          'div',
          {
            ref: dialogRef,
            className: 'dsh-pl-dialog',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'dsh-pl-dialog-title',
            onKeyDown,
          },
          h('h2', { id: 'dsh-pl-dialog-title', className: 'dsh-pl-dialog-title' }, t(editor.mode === 'edit' ? 'dialog.edit' : 'dialog.create')),
          h(
            'div',
            { className: 'dsh-pl-field' },
            h('label', { htmlFor: 'dsh-pl-title' }, t('form.title')),
            h('input', {
              id: 'dsh-pl-title',
              ref: titleRef,
              type: 'text',
              value: editor.title,
              placeholder: t('form.titlePlaceholder'),
              onChange: (event) => onChange({ title: event.target.value }),
            }),
          ),
          h(
            'div',
            { className: 'dsh-pl-field' },
            h('label', { htmlFor: 'dsh-pl-category' }, t('form.category')),
            h('input', {
              id: 'dsh-pl-category',
              type: 'text',
              value: editor.category,
              placeholder: t('form.categoryPlaceholder'),
              list: 'dsh-pl-category-options',
              onChange: (event) => onChange({ category: event.target.value }),
            }),
            h(
              'datalist',
              { id: 'dsh-pl-category-options' },
              categories.map((label) => h('option', { key: label, value: label })),
            ),
          ),
          h(
            'div',
            { className: 'dsh-pl-field' },
            h('label', { htmlFor: 'dsh-pl-body' }, t('form.body')),
            h('textarea', {
              id: 'dsh-pl-body',
              value: editor.body,
              placeholder: t('form.bodyPlaceholder'),
              onChange: (event) => onChange({ body: event.target.value }),
            }),
          ),
          editor.error ? h('p', { className: 'dsh-pl-form-error', role: 'alert' }, editor.error) : null,
          h(
            'div',
            { className: 'dsh-pl-dialog-foot' },
            h('span', { className: 'dsh-pl-hint' }, t('form.hint')),
            h(
              'div',
              { className: 'dsh-pl-dialog-actions' },
              h('button', { type: 'button', className: 'dsh-pl-btn', onClick: onClose }, t('action.cancel')),
              h('button', { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-primary', onClick: onSave }, t('action.save')),
            ),
          ),
        ),
      )
    }

    function CategoryDialog({ t, editor, onChange, onSave, onClose }) {
      const dialogRef = React.useRef(null)
      const inputRef = React.useRef(null)

      React.useEffect(() => {
        const previous = document.activeElement
        const input = inputRef.current
        if (input !== null && typeof input.focus === 'function') input.focus()
        return () => {
          if (previous !== null && typeof previous.focus === 'function') previous.focus()
        }
      }, [])

      const onKeyDown = (event) => {
        if (event.nativeEvent && event.nativeEvent.isComposing) return
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          onClose()
          return
        }
        if (event.key !== 'Tab') return
        const dialog = dialogRef.current
        if (dialog === null) return
        const nodes = dialog.querySelectorAll('button, input, [href], [tabindex]:not([tabindex="-1"])')
        const focusable = [...nodes].filter((node) => !node.disabled && node.offsetParent !== null)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }

      return h(
        'div',
        {
          className: 'dsh-pl-backdrop',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) onClose()
          },
        },
        h(
          'div',
          {
            ref: dialogRef,
            className: 'dsh-pl-dialog dsh-pl-dialog-sm',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'dsh-pl-category-dialog-title',
            onKeyDown,
          },
          h(
            'h2',
            { id: 'dsh-pl-category-dialog-title', className: 'dsh-pl-dialog-title' },
            t('dialog.category'),
          ),
          h(
            'div',
            { className: 'dsh-pl-field' },
            h('label', { htmlFor: 'dsh-pl-category-name' }, t('form.category')),
            h('input', {
              id: 'dsh-pl-category-name',
              ref: inputRef,
              type: 'text',
              maxLength: 40,
              value: editor.name,
              placeholder: t('form.categoryPlaceholder'),
              onChange: (event) => onChange({ name: event.target.value }),
              onKeyDown: (event) => {
                if (event.nativeEvent && event.nativeEvent.isComposing) return
                if (event.key !== 'Enter') return
                event.preventDefault()
                onSave()
              },
            }),
          ),
          editor.error ? h('p', { className: 'dsh-pl-form-error', role: 'alert' }, editor.error) : null,
          h(
            'div',
            { className: 'dsh-pl-dialog-foot' },
            h('span', { className: 'dsh-pl-hint' }),
            h(
              'div',
              { className: 'dsh-pl-dialog-actions' },
              h('button', { type: 'button', className: 'dsh-pl-btn', onClick: onClose }, t('action.cancel')),
              h('button', { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-primary', onClick: onSave }, t('action.save')),
            ),
          ),
        ),
      )
    }

    function PromptLibraryPage({ t, useSessions, onUse, onBack }) {
      const templates = React.useSyncExternalStore(subscribeTemplates, getTemplatesSnapshot)
      const categoryStore = React.useSyncExternalStore(subscribeCategories, getCategoriesSnapshot)
      const activeSessionId = useSessions((state) => {
        const byId = state && state.byId
        if (!byId) return undefined
        for (const key of Object.keys(byId)) {
          const row = byId[key]
          const retained = row && row.retainedBy ? row.retainedBy.mainView : 0
          if ((retained || 0) > 0) return (row && (row.id || row.sessionId)) || key
        }
        return undefined
      })

      const [query, setQuery] = React.useState('')
      const [category, setCategory] = React.useState('all')
      const [editor, setEditor] = React.useState(null)
      const [confirmId, setConfirmId] = React.useState(null)
      const [notice, setNotice] = React.useState(null)
      const [categoryEditor, setCategoryEditor] = React.useState(null)

      React.useEffect(() => {
        if (notice === null) return undefined
        const timer = window.setTimeout(() => setNotice(null), 3200)
        return () => window.clearTimeout(timer)
      }, [notice])

      React.useEffect(() => {
        if (confirmId === null) return undefined
        const timer = window.setTimeout(() => setConfirmId(null), 4500)
        return () => window.clearTimeout(timer)
      }, [confirmId])

      const items = buildItems(t)
      const categories = categoriesOf(items, categoryStore, t)
      const activeCategory =
        category === 'all' || categories.some((entry) => entry.key === category) ? category : 'all'
      const visible = filterItems(items, query, activeCategory)
      const builtinItems = visible.filter((item) => item.builtin)
      const mineItems = visible.filter((item) => !item.builtin)
      const noFilter = query.trim() === '' && activeCategory === 'all'
      const activeCategoryLabel = categories.find((entry) => entry.key === activeCategory)?.label ?? ''
      const categoryEmpty = visible.length === 0 && query.trim() === '' && activeCategory !== 'all'

      const openCreate = (initial) => {
        setEditor({
          mode: 'create',
          title: initial && initial.title ? initial.title : '',
          body: initial && initial.body ? initial.body : '',
          category: initial && initial.category ? initial.category : '',
          error: null,
        })
      }

      const openEdit = (item) => {
        setEditor({
          mode: 'edit',
          id: item.id,
          title: item.title,
          body: item.body,
          category: item.rawCategory || '',
          error: null,
        })
      }

      const openCategory = () => {
        setCategoryEditor({ name: '', error: null })
      }

      const changeCategoryEditor = (patch) => {
        setCategoryEditor((current) => (current === null ? current : { ...current, ...patch, error: null }))
      }

      const saveCategory = () => {
        if (categoryEditor === null) return
        const name = categoryEditor.name.trim()
        if (name === '') {
          setCategoryEditor({ ...categoryEditor, error: t('form.categoryRequired') })
          return
        }
        const existing = categories.find((entry) => entry.label.toLowerCase() === name.toLowerCase())
        if (existing !== undefined) {
          setCategory(existing.key)
          setCategoryEditor(null)
          setNotice({ text: t('notice.categoryExists'), tone: 'ok', key: Date.now() })
          return
        }
        const key = ensureUserCategory(name, t)
        if (key !== null) setCategory(key)
        setCategoryEditor(null)
        setNotice({ text: t('notice.categoryAdded'), tone: 'ok', key: Date.now() })
      }

      const changeEditor = (patch) => {
        setEditor((current) => (current === null ? current : { ...current, ...patch, error: null }))
      }

      const saveEditor = () => {
        if (editor === null) return
        const title = editor.title.trim()
        const body = editor.body.trim()
        if (title === '' || body === '') {
          setEditor({ ...editor, error: t('form.required') })
          return
        }
        let nextCategory = editor.category.trim()
        if (nextCategory !== '') {
          const categoryKey = ensureUserCategory(nextCategory, t)
          if (categoryKey !== null && categoryKey.startsWith('user:') && categoryKey !== 'user:') {
            nextCategory = categoryKey.slice('user:'.length)
          }
        }
        if (editor.mode === 'edit' && editor.id) {
          updateTemplate(editor.id, { title, body, category: nextCategory })
        } else {
          createTemplate({ title, body, category: nextCategory })
        }
        setEditor(null)
        setConfirmId(null)
      }

      const copyItem = async (item) => {
        try {
          if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
            throw new Error('clipboard-unavailable')
          }
          await navigator.clipboard.writeText(item.body)
          setNotice({ text: t('notice.copied'), tone: 'ok', key: Date.now() })
        } catch (error) {
          console.error('prompt-library: copy failed', error)
          setNotice({ text: t('notice.copyFailed'), tone: 'error', key: Date.now() })
        }
      }

      const insertItem = (item) => {
        onUse(item.body, activeSessionId !== undefined)
      }

      const duplicateItem = (item) => {
        openCreate({
          title: t('duplicate.title', { title: item.title }),
          body: item.body,
          category: item.builtin ? item.categoryLabel : item.rawCategory,
        })
      }

      const renderSection = (title, hint, list, emptyState) => {
        if (list.length === 0 && emptyState === null) return null
        return h(
          'section',
          { className: 'dsh-pl-section', key: title },
          h(
            'div',
            { className: 'dsh-pl-section-head' },
            h('h2', null, title),
            h('span', { className: 'dsh-pl-section-count' }, String(list.length)),
            hint ? h('span', { className: 'dsh-pl-section-hint' }, hint) : null,
          ),
          list.length === 0
            ? emptyState
            : h(
                'div',
                { className: 'dsh-pl-grid' },
                list.map((item) =>
                  h(TemplateCard, {
                    key: item.id,
                    item,
                    t,
                    confirming: confirmId === item.id,
                    onInsert: () => insertItem(item),
                    onCopy: () => copyItem(item),
                    onDuplicate: () => duplicateItem(item),
                    onEdit: () => openEdit(item),
                    onAskDelete: () => setConfirmId(item.id),
                    onCancelDelete: () => setConfirmId(null),
                    onDelete: () => {
                      deleteTemplate(item.id)
                      setConfirmId(null)
                    },
                  }),
                ),
              ),
        )
      }

      const mineEmpty = h(
        'div',
        { className: 'dsh-pl-empty' },
        h('p', { className: 'dsh-pl-empty-title' }, t('empty.mine')),
        h(
          'button',
          { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-primary dsh-pl-empty-action', onClick: () => openCreate() },
          h(PlusIcon, { size: 14 }),
          t('action.create'),
        ),
      )

      return h(
        'section',
        { className: 'dsh-pl-page', 'aria-label': t('page.title') },
        h('style', { key: 'style' }, PAGE_CSS),
        h(
          'div',
          { className: 'dsh-pl-scroll' },
          h(
            'div',
            { className: 'dsh-pl-content' },
            h(
              'header',
              { className: 'dsh-pl-heading' },
              h(
                'div',
                { className: 'dsh-pl-heading-text' },
                h('h1', null, t('page.title')),
                h('p', { className: 'dsh-pl-subtitle' }, t('page.subtitle')),
              ),
              h(
                'div',
                { className: 'dsh-pl-heading-actions' },
                h(
                  'button',
                  { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-primary', onClick: () => openCreate() },
                  h(PlusIcon, { size: 14 }),
                  t('action.create'),
                ),
                h(
                  'button',
                  { type: 'button', className: 'dsh-pl-icon-btn', 'aria-label': t('action.back'), title: t('action.back'), onClick: onBack },
                  h(ArrowLeftIcon, { size: 16 }),
                ),
              ),
            ),
            notice
              ? h(
                  'div',
                  { className: 'dsh-pl-notice', role: 'status', 'data-tone': notice.tone, key: notice.key },
                  notice.text,
                )
              : null,
            h(
              'div',
              { className: 'dsh-pl-toolbar' },
              h(
                'div',
                { className: 'dsh-pl-search' },
                h(SearchIcon, { size: 14 }),
                h('input', {
                  type: 'search',
                  value: query,
                  placeholder: t('search.placeholder'),
                  'aria-label': t('search.placeholder'),
                  onChange: (event) => {
                    setQuery(event.target.value)
                    setConfirmId(null)
                  },
                }),
                query !== ''
                  ? h(
                      'button',
                      {
                        type: 'button',
                        className: 'dsh-pl-search-clear',
                        'aria-label': t('search.clear'),
                        title: t('search.clear'),
                        onClick: () => setQuery(''),
                      },
                      h(CloseIcon, { size: 12 }),
                    )
                  : null,
              ),
              h(
                'div',
                { className: 'dsh-pl-chips', role: 'group' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsh-pl-chip',
                    'data-active': activeCategory === 'all' ? 'true' : 'false',
                    'aria-pressed': activeCategory === 'all',
                    onClick: () => setCategory('all'),
                  },
                  t('filter.all'),
                ),
                categories.map((entry) =>
                  h(
                    'button',
                    {
                      key: entry.key,
                      type: 'button',
                      className: 'dsh-pl-chip',
                      'data-active': activeCategory === entry.key ? 'true' : 'false',
                      'aria-pressed': activeCategory === entry.key,
                      onClick: () => setCategory(entry.key),
                    },
                    entry.label,
                  ),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsh-pl-chip dsh-pl-chip-add',
                    'aria-haspopup': 'dialog',
                    'aria-label': t('category.add'),
                    title: t('category.add'),
                    onClick: openCategory,
                  },
                  h(PlusIcon, { size: 11 }),
                  t('category.add'),
                ),
              ),
              h('div', { className: 'dsh-pl-count' }, t('count', { count: visible.length })),
            ),
            visible.length === 0
              ? h(
                  'div',
                  { className: 'dsh-pl-empty' },
                  h('p', { className: 'dsh-pl-empty-title' }, t(categoryEmpty ? 'empty.category' : 'empty.search')),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-pl-btn dsh-pl-btn-primary dsh-pl-empty-action',
                      onClick: () => openCreate(categoryEmpty ? { category: activeCategoryLabel } : undefined),
                    },
                    h(PlusIcon, { size: 14 }),
                    t(categoryEmpty ? 'action.createInCategory' : 'action.create'),
                  ),
                )
              : h(
                  React.Fragment,
                  null,
                  renderSection(t('section.builtin'), null, builtinItems, null),
                  renderSection(t('section.mine'), t('section.mineHint'), mineItems, noFilter ? mineEmpty : null),
                ),
          ),
        ),
        editor
          ? h(EditorDialog, {
              t,
              editor,
              categories: [...new Set(items.map((item) => item.categoryLabel))].sort((left, right) => left.localeCompare(right)),
              onChange: changeEditor,
              onSave: saveEditor,
              onClose: () => setEditor(null),
            })
          : null,
        categoryEditor
          ? h(CategoryDialog, {
              t,
              editor: categoryEditor,
              onChange: changeCategoryEditor,
              onSave: saveCategory,
              onClose: () => setCategoryEditor(null),
            })
          : null,
      )
    }

    function ComposerTrigger({ t }) {
      const open = React.useSyncExternalStore(subscribePicker, getPickerSnapshot)
      return h(
        'button',
        {
          type: 'button',
          className: 'dsh-pl-trigger-btn',
          'data-dsh-pl-trigger': '',
          'aria-label': t('composer.trigger'),
          title: t('composer.trigger'),
          'aria-haspopup': 'dialog',
          'aria-expanded': open ? 'true' : 'false',
          onClick: togglePicker,
        },
        h(TemplateIcon, { size: 16 }),
      )
    }

    function PromptPickerOverlay({ t, inputActions, onManage, useSession }) {
      const templates = React.useSyncExternalStore(subscribeTemplates, getTemplatesSnapshot)
      const open = React.useSyncExternalStore(subscribePicker, getPickerSnapshot)
      const blank = useSession((snapshot) => snapshot !== undefined && snapshot.blank === true)
      const [query, setQuery] = React.useState('')
      const [active, setActive] = React.useState(0)
      const [error, setError] = React.useState('')
      const [flash, setFlash] = React.useState(null)
      const searchRef = React.useRef(null)
      const popRef = React.useRef(null)
      const listRef = React.useRef(null)

      const items = buildItems(t)
      const visible = filterItems(items, query, 'all')
      const activeIndex = visible.length === 0 ? -1 : Math.min(active, visible.length - 1)

      React.useEffect(() => {
        if (!open) return undefined
        setQuery('')
        setActive(0)
        setError('')
        const frame = window.requestAnimationFrame(() => {
          const input = searchRef.current
          if (input !== null && typeof input.focus === 'function') input.focus()
        })
        return () => window.cancelAnimationFrame(frame)
      }, [open])

      React.useEffect(() => {
        if (!open) return
        const node = listRef.current
        if (node === null) return
        const selected = node.querySelector('[data-active="true"]')
        if (selected !== null && typeof selected.scrollIntoView === 'function') {
          selected.scrollIntoView({ block: 'nearest' })
        }
      }, [activeIndex, blank, open, query])

      React.useEffect(() => {
        if (!open) return undefined
        const onPointerDown = (event) => {
          const target = event.target
          if (!(target instanceof Node)) return
          if (popRef.current !== null && popRef.current.contains(target)) return
          const element = target instanceof Element ? target : target.parentElement
          if (element !== null && element.closest('[data-dsh-pl-trigger]') !== null) return
          setPickerOpen(false)
        }
        document.addEventListener('pointerdown', onPointerDown, true)
        return () => document.removeEventListener('pointerdown', onPointerDown, true)
      }, [open])

      React.useEffect(() => {
        let retry = null
        const attempt = () => {
          if (!inputActions) return
          const pending = pendingInsertion
          if (pending === null) return
          if (Date.now() - pending.at > PENDING_TTL) {
            clearInsertion(pending.nonce)
            return
          }
          let inserted = false
          try {
            const span = inputActions.captureInsertion()
            inserted = inputActions.insertText(pending.text, span)
          } catch (error) {
            console.error('prompt-library: could not insert a pending template', error)
            clearInsertion(pending.nonce)
            setFlash({ text: t('notice.insertFailed'), tone: 'error', key: Date.now() })
            return
          }
          if (inserted) {
            clearInsertion(pending.nonce)
            setFlash({ text: t('notice.inserted'), tone: 'ok', key: Date.now() })
            return
          }
          if (!pending.retried) {
            pending.retried = true
            retry = window.setTimeout(attempt, 250)
            return
          }
          clearInsertion(pending.nonce)
          setFlash({ text: t('notice.insertFailed'), tone: 'error', key: Date.now() })
        }
        attempt()
        const unsubscribe = subscribeInsertion(attempt)
        return () => {
          unsubscribe()
          if (retry !== null) window.clearTimeout(retry)
        }
      }, [inputActions, t])

      React.useEffect(() => {
        if (flash === null) return undefined
        const timer = window.setTimeout(() => setFlash(null), 2600)
        return () => window.clearTimeout(timer)
      }, [flash])

      const close = () => {
        setPickerOpen(false)
        setQuery('')
        setError('')
      }

      const insert = (item) => {
        if (!inputActions) return
        let inserted = false
        try {
          const span = inputActions.captureInsertion()
          inserted = inputActions.insertText(item.body, span)
        } catch (error) {
          console.error('prompt-library: could not insert the template', error)
          setError(t('notice.insertFailed'))
          return
        }
        if (inserted) {
          close()
          setFlash({ text: t('notice.inserted'), tone: 'ok', key: Date.now() })
        } else {
          setError(t('notice.insertFailed'))
        }
      }

      const onSearchChange = (event) => {
        setQuery(event.target.value)
        setActive(0)
        setError('')
      }

      const onSearchKeyDown = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          close()
          return
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          if (visible.length === 0) return
          setActive((current) => (current + 1) % visible.length)
          return
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          if (visible.length === 0) return
          setActive((current) => (current - 1 + visible.length) % visible.length)
          return
        }
        if (event.key === 'Enter') {
          event.preventDefault()
          if (activeIndex >= 0) insert(visible[activeIndex])
        }
      }

      const onPanelKeyDown = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          close()
          return
        }
        if (!blank || event.key !== 'Tab') return
        const panel = popRef.current
        if (panel === null) return
        const nodes = panel.querySelectorAll('button, input')
        const focusable = [...nodes].filter((node) => !node.disabled && node.offsetParent !== null)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }

      const content = h(
        React.Fragment,
        null,
        h(
          'div',
          { className: 'dsh-pl-pop-head' },
          h('div', { className: 'dsh-pl-pop-title' }, t('composer.title')),
          h(
            'div',
            { className: 'dsh-pl-pop-search' },
            h(SearchIcon, { size: 14 }),
            h('input', {
              ref: searchRef,
              type: 'search',
              value: query,
              placeholder: t('composer.search'),
              'aria-label': t('composer.search'),
              onChange: onSearchChange,
              onKeyDown: onSearchKeyDown,
            }),
          ),
        ),
        flash ? h('div', { className: 'dsh-pl-pop-flash', 'data-tone': flash.tone, role: 'status' }, flash.text) : null,
        h(
          'div',
          { ref: listRef, className: 'dsh-pl-pop-list' },
          visible.length === 0
            ? h('div', { className: 'dsh-pl-pop-empty' }, t('composer.empty'))
            : visible.map((item, index) =>
                h(
                  'button',
                  {
                    key: item.id,
                    type: 'button',
                    className: 'dsh-pl-pop-item',
                    'data-active': index === activeIndex ? 'true' : 'false',
                    onMouseEnter: () => setActive(index),
                    onClick: () => insert(item),
                  },
                  h('span', { className: 'dsh-pl-pop-item-title' }, item.title),
                  h(
                    'span',
                    { className: 'dsh-pl-pop-item-meta' },
                    `${item.categoryLabel} · ${t(item.builtin ? 'badge.builtin' : 'badge.mine')}`,
                  ),
                ),
              ),
        ),
        error ? h('div', { className: 'dsh-pl-pop-error', role: 'alert' }, error) : null,
        h(
          'div',
          { className: 'dsh-pl-pop-foot' },
          h('span', null, t('count', { count: visible.length })),
          h('button', { type: 'button', className: 'dsh-pl-pop-manage', onClick: onManage }, t('action.manage')),
        ),
      )

      const panel = h(
        'div',
        {
          ref: popRef,
          className: blank ? 'dsh-pl-pop dsh-pl-pop-modal' : 'dsh-pl-pop',
          role: 'dialog',
          'aria-modal': blank ? 'true' : undefined,
          'aria-label': t('composer.title'),
          onKeyDown: onPanelKeyDown,
        },
        content,
      )

      const body = open
        ? blank
          ? h(
              'div',
              {
                className: 'dsh-pl-pop-backdrop',
                onMouseDown: (event) => {
                  if (event.target === event.currentTarget) close()
                },
              },
              panel,
            )
          : panel
        : null

      return h(
        React.Fragment,
        null,
        h('style', { key: 'style' }, PICKER_CSS),
        body,
        !open && flash !== null
          ? h(
              'div',
              {
                key: flash.key,
                className: blank ? 'dsh-pl-flash dsh-pl-flash-fixed' : 'dsh-pl-flash',
                'data-tone': flash.tone,
                role: 'status',
              },
              flash.text,
            )
          : null,
      )
    }

    // #endregion

    // #region Plugin --------------------------------------------------------------

    function apply(ctx) {
      const t = ctx.locale.bind(NS)

      ctx.effect(() => ctx.locale.register(NS, { en: EN, zh: ZH }), 'prompt-library: dictionaries')

      ctx.effect(
        () =>
          ctx.slots.inject('sidebar.panellist', () =>
            ctx.slots.register(
              {
                name: 'sidebar.panellist',
                id: PANEL_ID,
                order: 20,
                label: () => t('panel.label'),
                locale: NS,
              },
              PromptLibraryIcon,
            ),
          ),
        'prompt-library: sidebar entry',
      )

      ctx.effect(
        () =>
          ctx.slots.inject('main', () =>
            ctx.slots.register(
              {
                name: 'main',
                key: PANEL_ID,
                locale: NS,
                inject: () => ({
                  onBack: () => ctx.layout.selectPanel('conversation'),
                  onUse: (body, hasSession) => {
                    if (hasSession) {
                      requestInsertion(body)
                      ctx.layout.selectPanel('conversation')
                      return
                    }
                    try {
                      ctx.layout.selectPanel('conversation')
                      ctx.uiWorkspace.startSession(undefined, { prompt: body, clearPreviousDraft: true })
                    } catch (error) {
                      console.error('prompt-library: could not start a conversation', error)
                    }
                  },
                }),
              },
              PromptLibraryPage,
            ),
          ),
        'prompt-library: main panel',
      )

      ctx.effect(
        () =>
          ctx.slots.inject('conversation.input.left', () =>
            ctx.slots.register(
              {
                name: 'conversation.input.left',
                id: PANEL_ID,
                order: 20,
                locale: NS,
              },
              ComposerTrigger,
            ),
          ),
        'prompt-library: composer trigger',
      )

      ctx.effect(
        () =>
          ctx.slots.inject('conversation.input.overlay', () =>
            ctx.slots.register(
              {
                name: 'conversation.input.overlay',
                id: PANEL_ID,
                order: 20,
                locale: NS,
                inject: () => ({
                  onManage: () => {
                    setPickerOpen(false)
                    ctx.layout.selectPanel(PANEL_ID)
                  },
                }),
              },
              PromptPickerOverlay,
            ),
          ),
        'prompt-library: composer picker',
      )
    }

    return { inject: ['slots', 'locale', 'layout', 'uiWorkspace'], apply }
  },
})
