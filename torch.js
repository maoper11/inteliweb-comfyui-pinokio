// Script 1 (Modo A) — Básico, compatible con todo
// - Sin xformers / flash / sage
// - Con --no-deps (entorno controlado)
// - Auto NVIDIA: RTX50->cu130, resto->cu128
// - AMD Linux auto => CPU (ROCm solo explícito)
// - macOS soportado

module.exports = {
  run: [

    // ------------------------------------------------------------
    // Limpiar torch previo + actualizar pip
    // ------------------------------------------------------------
    {
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip uninstall -y torch torchvision torchaudio || true",
          "python -m pip install -U pip"
        ]
      }
    },

    // ============================================================
    // WINDOWS NVIDIA
    // ============================================================

    // AUTO + RTX 50 => cu130
    {
      when: "{{platform === 'win32' && gpu === 'nvidia' && (['','auto'].includes(String(env.TORCH_VARIANT||'auto').toLowerCase())) && kernel.gpu_model && /50[0-9]{2}/.test(kernel.gpu_model)}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu130 --force-reinstall --no-deps"
        ]
      }
    },

    // AUTO + resto => cu128
    {
      when: "{{platform === 'win32' && gpu === 'nvidia' && (['','auto'].includes(String(env.TORCH_VARIANT||'auto').toLowerCase())) && (!kernel.gpu_model || !/50[0-9]{2}/.test(kernel.gpu_model))}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128 --force-reinstall --no-deps"
        ]
      }
    },

    // Explicit cu130
    {
      when: "{{platform === 'win32' && gpu === 'nvidia' && String(env.TORCH_VARIANT||'').toLowerCase()==='2.10.0-cu130'}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch==2.10.0 torchvision==0.25.0 torchaudio==2.10.0 --index-url https://download.pytorch.org/whl/cu130 --force-reinstall --no-deps"
        ]
      }
    },

    // Explicit cu128
    {
      when: "{{platform === 'win32' && gpu === 'nvidia' && String(env.TORCH_VARIANT||'').toLowerCase()==='2.9.1-cu128'}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch==2.9.1 torchvision==0.24.1 torchaudio==2.9.1 --index-url https://download.pytorch.org/whl/cu128 --force-reinstall --no-deps"
        ]
      }
    },

    // ============================================================
    // LINUX NVIDIA (misma lógica)
    // ============================================================

    {
      when: "{{platform === 'linux' && gpu === 'nvidia' && (['','auto'].includes(String(env.TORCH_VARIANT||'auto').toLowerCase())) && kernel.gpu_model && /50[0-9]{2}/.test(kernel.gpu_model)}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu130 --force-reinstall --no-deps"
        ]
      }
    },

    {
      when: "{{platform === 'linux' && gpu === 'nvidia' && (['','auto'].includes(String(env.TORCH_VARIANT||'auto').toLowerCase())) && (!kernel.gpu_model || !/50[0-9]{2}/.test(kernel.gpu_model))}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128 --force-reinstall --no-deps"
        ]
      }
    },

    // ============================================================
    // macOS
    // ============================================================

    {
      when: "{{platform === 'darwin' && arch === 'arm64'}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch torchvision torchaudio --force-reinstall --no-deps"
        ]
      }
    },

    {
      when: "{{platform === 'darwin' && arch === 'x64'}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu --force-reinstall --no-deps"
        ]
      }
    },

    // ============================================================
    // WINDOWS AMD (DirectML)
    // ============================================================

    {
      when: "{{platform === 'win32' && gpu === 'amd' && (['','auto','directml'].includes(String(env.TORCH_VARIANT||'auto').toLowerCase()))}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch-directml torchvision torchaudio numpy==1.26.4 --force-reinstall --no-deps"
        ]
      }
    },

    // ============================================================
    // LINUX AMD
    // ============================================================

    // Auto => CPU
    {
      when: "{{platform === 'linux' && gpu === 'amd' && (['','auto'].includes(String(env.TORCH_VARIANT||'auto').toLowerCase()))}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu --force-reinstall --no-deps"
        ]
      }
    },

    // Explicit ROCm
    {
      when: "{{platform === 'linux' && gpu === 'amd' && String(env.TORCH_VARIANT||'').toLowerCase()==='2.7.0-rocm6.3'}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch==2.7.0 torchvision==0.22.0 torchaudio==2.7.0 --index-url https://download.pytorch.org/whl/rocm6.3 --force-reinstall --no-deps"
        ]
      }
    },

    // ============================================================
    // CPU fallback universal
    // ============================================================

    {
      when: "{{String(env.TORCH_VARIANT||'').toLowerCase()==='cpu'}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu --force-reinstall --no-deps"
        ]
      }
    },

    // ------------------------------------------------------------
    // Sanity check final
    // ------------------------------------------------------------
    {
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -c \"import torch; print('torch', torch.__version__); print('cuda_available', torch.cuda.is_available()); print('cuda_version', torch.version.cuda); print('mps_available', hasattr(torch.backends,'mps') and torch.backends.mps.is_available()); print('hip_version', getattr(torch.version,'hip',None))\""
        ]
      }
    }

  ]
};
