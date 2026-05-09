import { SignInButton, SignUpButton, UserButton, Show } from '@clerk/react'
import './App.css'

function App() {
  return (
    <>
      <header>
        <Show when="signed-out">
          <SignInButton />
          <SignUpButton />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
    </>
  )
}

export default App