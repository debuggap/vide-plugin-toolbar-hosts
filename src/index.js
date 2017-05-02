import App from './App.vue'
import path from 'path'
export default ({editor, store, view, packageInfo, baseClass}) => {
  let isCreated = false
  // add item to toolbar
  store.dispatch('toolbar/addItem', {
    name: 'hosts',
    desc: 'hosts tool',
    icon: 'data:image/png;base64,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',
    func: 'videPluginToolbarHosts:click'
  })
  // return execute class
  return class videPluginToolbarHosts extends baseClass {
    click () {
      if (isCreated) {
        this.$toggle()
      } else {
        isCreated = true
        let self = this
        let props = {
          propsData: {
            callback: function () {
              self.$toggle()
            }
          }
        }
        let stylePath = path.join(packageInfo.path, './dist/index.css')
        this.$mount({app: App, props, stylePath})
      }
    }
  }
}
