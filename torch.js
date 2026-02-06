module.exports = {
  run: [
    // -----------------------------
    // Helper step: remove old torch
    // -----------------------------
    {
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip uninstall -y torch torchvision torchaudio || exit /b 0",
          "python -m pip install -U pip"
        ]
      }
    },

    // ============================================================
    // WINDOWS NVIDIA
    // ============================================================

    // auto OR explicit 2.9.1-cu128
    {
      when: "{{platform === 'win32' && gpu === 'nvidia' && (['','auto','2.9.1-cu128'].includes(String(env.TORCH_VARIANT||'auto').toLowerCase()))}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch==2.9.1 torchvision==0.24.1 torchaudio==2.9.1 --index-url https://download.pytorch.org/whl/cu128 --force-reinstall --no-deps"
        ]
      }
    },

    // explicit 2.7.0-cu128
    {
      when: "{{platform === 'win32' && gpu === 'nvidia' && (String(env.TORCH_VARIANT||'').toLowerCase() === '2.7.0-cu128')}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch==2.7.0 torchvision==0.22.0 torchaudio==2.7.0 --index-url https://download.pytorch.org/whl/cu128 --force-reinstall --no-deps"
        ]
      }
    },

    // explicit 2.10.0-cu130  (requested)
    {
      when: "{{platform === 'win32' && gpu === 'nvidia' && (String(env.TORCH_VARIANT||'').toLowerCase() === '2.10.0-cu130')}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch==2.10.0 torchvision==0.25.0 torchaudio==2.10.0 --index-url https://download.pytorch.org/whl/cu130 --force-reinstall --no-deps"
        ]
      }
    },

    // ============================================================
    // LINUX NVIDIA
    // ============================================================

    // auto OR explicit 2.9.1-cu128
    {
      when: "{{platform === 'linux' && gpu === 'nvidia' && (['','auto','2.9.1-cu128'].includes(String(env.TORCH_VARIANT||'auto').toLowerCase()))}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch==2.9.1 torchvision==0.24.1 torchaudio==2.9.1 --index-url https://download.pytorch.org/whl/cu128 --force-reinstall --no-deps"
        ]
      }
    },

    // explicit 2.7.0-cu128
    {
      when: "{{platform === 'linux' && gpu === 'nvidia' && (String(env.TORCH_VARIANT||'').toLowerCase() === '2.7.0-cu128')}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch==2.7.0 torchvision==0.22.0 torchaudio==2.7.0 --index-url https://download.pytorch.org/whl/cu128 --force-reinstall --no-deps"
        ]
      }
    },

    // explicit 2.10.0-cu130
    {
      when: "{{platform === 'linux' && gpu === 'nvidia' && (String(env.TORCH_VARIANT||'').toLowerCase() === '2.10.0-cu130')}}",
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -m pip install torch==2.10.0 torchvision==0.25.0 torchaudio==2.10.0 --index-url https://download.pytorch.org/whl/cu130 --force-reinstall --no-deps"
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
          "python -m pip install torch-directml torchvision torchaudio numpy==1.26.4 --force-reinstall"
        ]
      }
    },

    // ============================================================
    // LINUX AMD (ROCm 6.3)
    // ============================================================
    {
      when: "{{platform === 'linux' && gpu === 'amd' && (['','auto','2.7.0-rocm6.3'].includes(String(env.TORCH_VARIANT||'auto').toLowerCase()))}}",
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
    // CPU
    // ============================================================
    {
      when: "{{(['cpu'].includes(String(env.TORCH_VARIANT||'').toLowerCase())) || ((String(env.TORCH_VARIANT||'auto').toLowerCase()==='auto') && (gpu !== 'nvidia' && gpu !== 'amd'))}}",
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
    // Sanity check (prints torch + cuda availability)
    // ------------------------------------------------------------
    {
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "python -c \"import torch; print('torch', torch.__version__); print('cuda_available', torch.cuda.is_available()); print('cuda_version', torch.version.cuda)\""
        ]
      }
    }
  ]
};
