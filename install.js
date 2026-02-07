module.exports = async (kernel, info) => {

  const comfyBranch =
    process.env.COMFY_VER === "latest"
      ? "master"
      : process.env.COMFY_VER || "master"

  const run = [
    // 1) Clone ComfyUI into ./app
    {
      method: "shell.run",
      params: {
        message: "git clone --branch ${comfyBranch} --depth 1 https://github.com/comfyanonymous/ComfyUI app"
      }
    },

    // 2) Optional examples repo (workflows)
    // {
    //   method: "shell.run",
    //   params: {
    //     message: "git clone https://github.com/comfyanonymous/ComfyUI_examples",
    //     path: "workflows"
    //   }
    // },

    // 3) ComfyUI-Manager
    {
      method: "shell.run",
      params: {
        message: "git clone https://github.com/ltdrdata/ComfyUI-Manager",
        path: "app/custom_nodes"
      }
    },

    // 4) Crear venv con Python
    {
      method: "shell.run",
      params: {
        path: "app",
        message: [
          // Elegir versión objetivo
          "uv python install {{env.PYTHON_VER || '3.12'}}",

          // Borrar venv (cross-platform)
          "{{ platform === 'win32' ? 'if exist env rmdir /s /q env' : 'rm -rf env' }}",

          // Crear venv con la versión elegida
          "uv venv --python {{env.PYTHON_VER || '3.12'}} env",
        ],
      },
    },

    // 5) Instalar requisitos base de ComfyUI usando ese venv
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "uv pip install -U pip setuptools wheel",
          "uv pip install -r requirements.txt",
          "uv pip install -r custom_nodes/ComfyUI-Manager/requirements.txt",
          "uv pip install -U bitsandbytes",
          "uv pip install -U requests"
        ],
      },
    },

    // 6) Install Torch (variant-based) - NO xformers/flash/sage for now
    {
      method: "script.start",
      params: {
        uri: "torch.js",
        params: {
          venv: "env",
          path: "app"
        }
      }
    },

    // 7) Link model folders to Pinokio drive
    {
      method: "fs.link",
      params: {
        drive: {
          checkpoints: "app/models/checkpoints",
          clip: "app/models/clip",
          clip_vision: "app/models/clip_vision",
          configs: "app/models/configs",
          controlnet: "app/models/controlnet",
          embeddings: "app/models/embeddings",
          loras: "app/models/loras",
          upscale_models: "app/models/upscale_models",
          vae: "app/models/vae",
          vae_approx: "app/models/VAE-approx",
          diffusers: "app/models/diffusers",
          unet: "app/models/unet",
          hypernetworks: "app/models/hypernetworks",
          gligen: "app/models/gligen",
          style_models: "app/models/style_models",
          photomaker: "app/models/photomaker",
          diffusion_models: "app/models/diffusion_models",
          text_encoders: "app/models/text_encoders"


        },
        peers: [
          "https://github.com/cocktailpeanut/fluxgym.git",
          "https://github.com/cocktailpeanutlabs/automatic1111.git",
          "https://github.com/cocktailpeanutlabs/fooocus.git",
          "https://github.com/cocktailpeanutlabs/comfyui.git",
          "https://github.com/pinokiofactory/stable-diffusion-webui-forge.git"
        ]
      }
    },

    // output link
    {
      method: "fs.link",
      params: {
        drive: { output: "app/output" }
      }
    },

    // 8) Optional Flux Schnell autodownload
    // {
    //   when: "{{['true','1'].includes(String(env.FLUX_AUTODOWNLOAD).toLowerCase())}}",
    //   method: "script.start",
    //   params: {
    //     uri: "hf.json",
    //     params: {
    //       repo: "Comfy-Org/flux1-schnell",
    //       files: "flux1-schnell-fp8.safetensors",
    //       path: "app/models/checkpoints"
    //     }
    //   }
    // },

    // 9) First launch to print local URL and stop
    {
      method: "shell.run",
      params: {
        venv: "env",
        env: {
          PYTORCH_ENABLE_MPS_FALLBACK: "1",
          TOKENIZERS_PARALLELISM: "false"
        },
        path: "app",
        message: [
          "{{platform === 'win32' && gpu === 'amd' ? 'python main.py --directml' : 'python main.py'}}"
        ],
        on: [
          { event: "/http:\\/\\/[a-zA-Z0-9.]+:[0-9]+/", kill: true },
          { event: "/errno/i", break: false },
          { event: "/error:/i", break: false }
        ]
      }
    }

    // 10) Optional extra workflows
    // {
    //   method: "shell.run",
    //   params: {
    //     message: "git clone https://github.com/comfyanonymous/ComfyUI_examples",
    //     path: "app/user/default/workflows"
    //   }
    // }
    // {
    //   method: "shell.run",
    //   params: {
    //     message: "git clone https://github.com/cocktailpeanut/comfy_json_workflow",
    //     path: "app/user/default/workflows"
    //   }
    // }
  ];

  return {
    run,
    requires: { bundle: "ai" }
  };
};