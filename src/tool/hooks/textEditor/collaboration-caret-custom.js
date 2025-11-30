// src/collaboration-caret-custom.js
import { Extension } from '@tiptap/core'
import { defaultSelectionBuilder, yCursorPlugin } from '@tiptap/y-tiptap'

const awarenessStatesToArray = (states) => {
  return Array.from(states.entries()).map(([clientId, awareness]) => {
    return {
      clientId: clientId,
      ...awareness,
    }
  })
}

const defaultOnUpdate = () => null

export const CustomCollaborationCaret = Extension.create({
  name: 'customCollaborationCaret',

  priority: 999,

  addOptions() {
    return {
      provider: null,
      user: {
        name: 'Anonymous',
        color: '#888888',
        userId: -1,
      },
      render: user => {
        const cursor = document.createElement('span')

        cursor.classList.add('collaboration-carets__caret')
        cursor.setAttribute('style', `border-color: ${user.color}`)

        const label = document.createElement('div')

        label.classList.add('collaboration-carets__label')
        label.setAttribute('style', `background-color: ${user.color}`)
        label.insertBefore(document.createTextNode(user.name), null)
        cursor.insertBefore(label, null)

        return cursor
      },
      selectionRender: defaultSelectionBuilder,
      onUpdate: defaultOnUpdate,
    }
  },

  onCreate() {
    if (!this.options.provider) {
      throw new Error('The "provider" option is required for the CollaborationCaret extension')
    }
  },

  addStorage() {
    return {
      users: [],
    }
  },

  addCommands() {
    return {
      updateUser: (attributes) => () => {
        this.options.user = {...this.options.user, ...attributes}

        this.options.provider.awareness.setLocalStateField('user', this.options.user)

        return true
      },
      user: attributes => ({ editor }) => {
        console.warn(
          '[tiptap warn]: DEPRECATED: The "user" command is deprecated. Please use "updateUser" instead. Read more: https://tiptap.dev/api/extensions/collaboration-caret',
        )

        return editor.commands.updateUser(attributes)
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      yCursorPlugin(
        (() => {
          this.options.provider.awareness.setLocalStateField('user', this.options.user)

          this.storage.users = awarenessStatesToArray(this.options.provider.awareness.states)

          this.options.provider.awareness.on('update', () => {
            console.log('Awareness states updated:', this.options.provider.awareness.states)
            this.storage.users = awarenessStatesToArray(this.options.provider.awareness.states)
          })

          return this.options.provider.awareness
        })(),
        {
          cursorBuilder: this.options.render,
          selectionBuilder: this.options.selectionRender,
        },
      ),
    ]
  },
})