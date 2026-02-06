module.exports = async (kernel, info) => {
  const run = [
    // 1) Clone ComfyUI into ./app
    {
      method: "shell.run",
      params: {
        message: "git clone https://github.com/comfyanonymous/ComfyUI app"
      }
    },

    // 2) Checkout desired ref (robust for master/main/tag/commit)
    {
      method: "shell.run",
      params: {
        path: "app",
        message: [
          "git fetch --all --tags",
          // Try COMFY_REF first, then master, then main (so COMFY_REF=main works too)
          "git checkout {{env.COMFY_REF || 'master'}} || git checkout master || git checkout main"
        ]
      }
    },

    // 3) Optional examples repo (workflows)
    {
      method: "shell.run",
      params: {
        message: "git clone https://github.com/comfyanonymous/ComfyUI_examples",
        path: "workflows"
      }
    },

    // 4) ComfyUI-Manager
    {
      method: "shell.run",
      params: {
        message: "git clone https://github.com/ltdrdata/ComfyUI-Manager",
        path: "app/custom_nodes"
      }
    },

    // 5) Install python deps (add requests to avoid prestartup failure)
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "uv pip install -r requirements.txt",
          "uv pip install -U requests bitsandbytes"
        ]
      }
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
          photomaker: "app/models/photomaker"
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
    {
      when: "{{['true','1'].includes(String(env.FLUX_AUTODOWNLOAD).toLowerCase())}}",
      method: "script.start",
      params: {
        uri: "hf.json",
        params: {
          repo: "Comfy-Org/flux1-schnell",
          files: "flux1-schnell-fp8.safetensors",
          path: "app/models/checkpoints"
        }
      }
    },

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
    },

    // 10) Optional extra workflows
    {
      method: "shell.run",
      params: {
        message: "git clone https://github.com/comfyanonymous/ComfyUI_examples",
        path: "app/user/default/workflows"
      }
    },
    {
      method: "shell.run",
      params: {
        message: "git clone https://github.com/cocktailpeanut/comfy_json_workflow",
        path: "app/user/default/workflows"
      }
    }
  ];

  return {
    run,
    requires: { bundle: "ai" }
  };
};