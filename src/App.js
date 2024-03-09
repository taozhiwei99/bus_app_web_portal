import React, { Component, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import './scss/defaultstyle.scss'

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./common/Login'))
const Page404 = React.lazy(() => import('./common/Page404'))
const Page500 = React.lazy(() => import('./common/Page500'))

class App extends Component {
  render() {
    return (
      <HashRouter>
        <Suspense fallback={loading}>
          <Routes>
            {/* IMPORTANT for default web layout, do not delete path="*" */}
            <Route path="*" name="Home" element={<DefaultLayout />} /> 
            <Route path="/" element={<Login />} />
            <Route exact path="/404" name="Page 404" element={<Page404 />} />
            <Route exact path="/500" name="Page 500" element={<Page500 />} />
          </Routes>
        </Suspense>
      </HashRouter>
    )
  }
}

export default App