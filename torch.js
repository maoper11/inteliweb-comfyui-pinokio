// Inteliweb AI - Torch installer (user-friendly variants)
// Supported TORCH_VARIANT values:
//
// - auto
// - 2.7.0-cu128
// - 2.9.1-cu128
// - 2.10.0-cu130
// - 2.7.0-rocm6.3
// - directml
// - cpu
//
// Backward-compatible aliases (old values):
// - cu128-2.7.0      -> 2.7.0-cu128
// - cu128-2.9.1      -> 2.9.1-cu128
// - cu130-2.10.0     -> 2.10.0-cu130
// - rocm63-2.7.0     -> 2.7.0-rocm6.3
// - win-amd-directml -> directml
// - cpu              -> cpu

function normalize(s) {
  return (s || "").toString().trim().toLowerCase();
}

function mapAliasToFriendly(variantRaw) {
  const v = normalize(variantRaw);

  if (!v || v === "auto") return "auto";

  // Friendly already?
  // ex: 2.10.0-cu130, 2.7.0-rocm6.3
  if (/^\d+\.\d+\.\d+-(cu128|cu130|rocm6\.3)$/.test(v)) return v;

  // Direct keywords
  if (v === "cpu") return "cpu";
  if (v === "directml") return "directml";

  // Old aliases
  if (v === "cu128-2.7.0") return "2.7.0-cu128";
  if (v === "cu128-2.9.1") return "2.9.1-cu128";
  if (v === "cu130-2.10.0") return "2.10.0-cu130";
  if (v === "rocm63-2.7.0") return "2.7.0-rocm6.3";
  if (v === "win-amd-directml") return "directml";

  // Very old “verbose” patterns (si los usaste antes)
  if (v.includes("torch270") && v.includes("cu128")) return "2.7.0-cu128";
  if (v.includes("torch291") && v.includes("cu128")) return "2.9.1-cu128";
  if (v.includes("torch2100") && v.includes("cu130")) return "2.10.0-cu130";
  if (v.includes("rocm63") && v.includes("torch270")) return "2.7.0-rocm6.3";

  // Unknown -> auto (safe fallback)
  return "auto";
}

function pickDefaultVariant(platform, gpu) {
  // Defaults razonables por OS/GPU
  if ((platform === "win32" || platform === "linux") && gpu === "nvidia") return "2.7.0-cu128";
  if (platform === "linux" && gpu === "amd") return "2.7.0-rocm6.3";
  if (platform === "win32" && gpu === "amd") return "directml";
  return "cpu";
}

function buildTorchInstallCmd(platform, gpu, friendlyVariant) {
  // AMD Windows -> DirectML
  if (platform === "win32" && gpu === "amd") {
    return "uv pip install torch-directml torchvision torchaudio numpy==1.26.4 --force-reinstall";
  }

  // macOS -> CPU/MPS (torch normal)
  if (platform === "darwin") {
    return "uv pip install torch torchvision torchaudio --force-reinstall --no-deps";
  }

  // CPU explícito
  if (friendlyVariant === "cpu") {
    if (platform === "linux") {
      return "uv pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu --force-reinstall --no-deps";
    }
    return "uv pip install torch torchvision torchaudio --force-reinstall --no-deps";
  }

  // Linux AMD ROCm
  if (platform === "linux" && gpu === "amd") {
    // por ahora solo 2.7.0 + rocm6.3
    return "uv pip install torch==2.7.0 torchvision==0.22.0 torchaudio==2.7.0 --index-url https://download.pytorch.org/whl/rocm6.3 --force-reinstall --no-deps";
  }

  // NVIDIA Win/Linux
  if ((platform === "win32" || platform === "linux") && gpu === "nvidia") {
    if (friendlyVariant === "2.10.0-cu130") {
      return "uv pip install torch==2.10.0 torchvision torchaudio --index-url https://download.pytorch.org/whl/cu130 --force-reinstall --no-deps";
    }
    if (friendlyVariant === "2.9.1-cu128") {
      return "uv pip install torch==2.9.1 torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128 --force-reinstall --no-deps";
    }
    // default: 2.7.0-cu128
    return "uv pip install torch==2.7.0 torchvision==0.22.0 torchaudio==2.7.0 --index-url https://download.pytorch.org/whl/cu128 --force-reinstall --no-deps";
  }

  // Fallback CPU
  if (platform === "linux") {
    return "uv pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu --force-reinstall --no-deps";
  }
  return "uv pip install torch torchvision torchaudio --force-reinstall --no-deps";
}

module.exports = {
  run: [
    // Info
    {
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "{{(() => { const v = (args && args.variant) ? args.variant : (env.TORCH_VARIANT || 'auto'); return `echo Requested TORCH_VARIANT=${v}`; })()}}",
          "{{(() => { return `echo Platform=${platform} GPU=${gpu} Arch=${arch}`; })()}}"
        ]
      }
    },

    // Uninstall (portable)
    {
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "uv pip uninstall -y torch torchvision torchaudio || true"
        ]
      }
    },

    // Install (decide variant)
    {
      method: "shell.run",
      params: {
        venv: "{{args && args.venv ? args.venv : null}}",
        path: "{{args && args.path ? args.path : '.'}}",
        message: [
          "{{(() => { " +
            "const requestedRaw = (args && args.variant) ? args.variant : (env.TORCH_VARIANT || 'auto'); " +
            "const friendlyReq = mapAliasToFriendly(requestedRaw); " +
            "const finalVar = (friendlyReq && friendlyReq !== 'auto') ? friendlyReq : pickDefaultVariant(platform, gpu); " +
            "const cmd = buildTorchInstallCmd(platform, gpu, finalVar); " +
            "return `echo Using TORCH_VARIANT=${finalVar} && ${cmd}`; " +
          "})()}}"
        ]
      }
    }
  ]
};
