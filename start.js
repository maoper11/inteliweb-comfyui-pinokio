module.exports = {
  requires: { bundle: "ai" },
  daemon: true,
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
        env: {
          PYTORCH_ENABLE_MPS_FALLBACK: "1",
          TOKENIZERS_PARALLELISM: "false",
        },
        path: "app",
        message: [
          "{{platform === 'win32' && gpu === 'amd' ? 'python main.py --directml' : 'python main.py'}}",
        ],
        on: [

          // 🔁 Manager pidió reinicio
          {
            event: "/\\bRestart(ing)?\\b.*\\b(reapply|dependenc(y|ies)?)\\b/i",
            done: true,
          },

          // 🌐 ComfyUI listo
          {
            event: "/To see the GUI go to:\\s*(https?:\\/\\/[^\\s]+)/i",
            done: true,
          },

          // fallback 1
          {
            event: "/starting server.*?(https?:\\/\\/[^\\s]+)/i",
            done: true,
          },

          // fallback 2
          {
            event: "/(http:\\/\\/(?:127\\.0\\.0\\.1|localhost|\\d+\\.\\d+\\.\\d+\\.\\d+):\\d{2,5})/i",
            done: true,
          },
          
          { event: "/errno/i", break: false },
          { event: "/error:/i", break: false },
        ],
      },
    },

    // 📄 Decisión final de vista
    {
      method: "local.set",
      params: {
        url: "{{ (input && input.event && input.event[1] && /^https?:\\/\\//.test(input.event[1])) ? input.event[1] : 'restart_notice.html?raw=true' }}",
      },
    },
  ],
};
