declare module 'sockjs-client' {
  // 用 any 兜底，避免 sockjs-client 缺少官方类型时导致构建失败
  const SockJS: any;
  export default SockJS;
}
