export function toSolidStartHandler(
  chiron:
    | {
        handler: (request: Request) => Promise<Response>;
      }
    | ((request: Request) => Promise<Response>)
) {
  const handler = async (event: { request: Request }) => {
    return "handler" in chiron
      ? chiron.handler(event.request)
      : chiron(event.request);
  };
  return {
    GET: handler,
    POST: handler,
  };
}
