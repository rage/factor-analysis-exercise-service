import { createParentConnection } from "@moocfi/exercise-client"
import { useEffect, useState } from "react"

/**
 * Used in exercise services when we want to establish a connection to the parent page for receiving and sending messages. The only argument is a callback function that is called when a message is received from the parent.
 *
 * Returns the port once the parent has sent one, null until then. A new `onMessage` identity
 * restarts the handshake, so pass a stable callback.
 *
 * How this connection establisment works and what are the allowed messages are documented here: https://github.com/rage/secret-project-331/blob/master/docs/iframes.md
 */
function useExerciseServiceParentConnection(
  onMessage: (messageData: unknown, port: MessagePort) => void,
) {
  const [port, setPort] = useState<MessagePort | null>(null)
  useEffect(() => {
    const connection = createParentConnection({ onMessage })
    connection.onPort(setPort)
    return () => connection.dispose()
  }, [onMessage])
  return port
}

export default useExerciseServiceParentConnection
