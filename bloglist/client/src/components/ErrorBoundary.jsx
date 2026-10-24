import { Component } from 'react'
export default class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <section role="alert"><h2>Something went wrong</h2><p>Please return to blogs using the navigation, or reload the page.</p></section> : this.props.children
  }
}
