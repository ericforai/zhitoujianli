/*!
 * 智投简历桌面端 — Rust 侧
 * 负责拉起内置 boss_local_agent.py（Token 模式，与网站 JWT 打通）
 */
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use serde::Serialize;
use tauri::path::BaseDirectory;
use tauri::Manager;
use tauri::State;

/// 子进程句柄（单例）
pub struct AgentState(pub Mutex<Option<Child>>);

/// 解析本机 Python 可执行文件路径（跨平台）
fn resolve_python_executable() -> Result<PathBuf, String> {
    #[cfg(target_os = "windows")]
    {
        if let Ok(p) = python_path_via_py_launcher("-3") {
            return Ok(p);
        }
        if let Ok(p) = python_path_via_py_launcher("-3.12") {
            return Ok(p);
        }
        for cmd in ["python", "python3"] {
            if let Ok(p) = python_path_via_cmd(cmd) {
                return Ok(p);
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        for cmd in ["python3", "python", "python3.12", "python3.11"] {
            if let Ok(p) = python_path_via_cmd(cmd) {
                return Ok(p);
            }
        }
    }
    Err(
        "未找到 Python 3。请从 python.org 安装并勾选「Add to PATH」，或 macOS 执行 brew install python。"
            .into(),
    )
}

fn python_path_via_cmd(name: &str) -> Result<PathBuf, String> {
    let out = Command::new(name)
        .args(["-c", "import sys; print(sys.executable)"])
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .output()
        .map_err(|e| e.to_string())?;
    if !out.status.success() {
        return Err("fail".into());
    }
    let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
    if s.is_empty() {
        return Err("empty".into());
    }
    let p = PathBuf::from(&s);
    if p.exists() {
        Ok(p)
    } else {
        Err("missing".into())
    }
}

#[cfg(target_os = "windows")]
fn python_path_via_py_launcher(flag: &str) -> Result<PathBuf, String> {
    let out = Command::new("py")
        .args([flag, "-c", "import sys; print(sys.executable)"])
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .output()
        .map_err(|e| e.to_string())?;
    if !out.status.success() {
        return Err("fail".into());
    }
    let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
    if s.is_empty() {
        return Err("empty".into());
    }
    let p = PathBuf::from(&s);
    if p.exists() {
        Ok(p)
    } else {
        Err("missing".into())
    }
}

/// 内置脚本路径：打包资源优先，开发时回退到 src-tauri/resources
fn resolve_agent_script(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let bundled = app
        .path()
        .resolve("agent/boss_local_agent.py", BaseDirectory::Resource);
    if let Ok(p) = bundled {
        if p.exists() {
            return Ok(p);
        }
    }
    let fallbacks = [
        PathBuf::from("src-tauri/resources/agent/boss_local_agent.py"),
        PathBuf::from("../src-tauri/resources/agent/boss_local_agent.py"),
    ];
    for p in &fallbacks {
        if p.exists() {
            return Ok(p
                .canonicalize()
                .unwrap_or_else(|_| p.clone()));
        }
    }
    Err(
        "找不到 boss_local_agent.py。请确认已执行 npm run tauri:dev / tauri build，且 resources 已配置。"
            .into(),
    )
}

fn resolve_requirements_txt(script: &Path) -> PathBuf {
    script
        .parent()
        .unwrap_or(Path::new("."))
        .join("requirements.txt")
}

fn apply_no_window(_cmd: &mut Command) {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        _cmd.creation_flags(CREATE_NO_WINDOW);
    }
}

#[derive(Serialize)]
pub struct AgentDiagnose {
    pub python_exe: Option<String>,
    pub python_version: Option<String>,
    pub script_path: Option<String>,
    pub requirements_path: Option<String>,
    pub script_ok: bool,
    pub requirements_ok: bool,
    pub summary: String,
}

/// 环境自检（供界面展示）
#[tauri::command]
fn agent_diagnose(app: tauri::AppHandle) -> Result<AgentDiagnose, String> {
    let py_exe = resolve_python_executable().ok();
    let py_ver = py_exe.as_ref().and_then(|exe| {
        Command::new(exe)
            .arg("--version")
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .ok()
            .filter(|o| o.status.success())
            .map(|o| {
                let a = String::from_utf8_lossy(&o.stdout);
                let b = String::from_utf8_lossy(&o.stderr);
                format!("{}{}", a, b).trim().to_string()
            })
    });

    let script = resolve_agent_script(&app).ok();
    let req = script
        .as_ref()
        .map(|s| resolve_requirements_txt(s));
    let req_ok = req.as_ref().map(|p| p.exists()).unwrap_or(false);

    let mut summary = String::new();
    if py_exe.is_none() {
        summary.push_str("未检测到 Python；");
    } else {
        summary.push_str("Python 可用；");
    }
    if script.is_none() {
        summary.push_str("未找到 Agent 脚本；");
    } else {
        summary.push_str("Agent 脚本已找到；");
    }
    if !req_ok {
        summary.push_str("requirements.txt 缺失。");
    } else {
        summary.push_str("requirements.txt 已找到。");
    }

    Ok(AgentDiagnose {
        python_exe: py_exe.as_ref().map(|p| p.display().to_string()),
        python_version: py_ver,
        script_path: script.as_ref().map(|p| p.display().to_string()),
        requirements_path: req.as_ref().map(|p| p.display().to_string()),
        script_ok: script.is_some(),
        requirements_ok: req_ok,
        summary,
    })
}

/// 一键安装 pip 依赖 + Playwright Chromium（阻塞执行，返回日志摘要）
#[tauri::command]
fn agent_install_deps(app: tauri::AppHandle) -> Result<String, String> {
    let py = resolve_python_executable()?;
    let script = resolve_agent_script(&app)?;
    let req = resolve_requirements_txt(&script);
    if !req.exists() {
        return Err(format!(
            "找不到 requirements.txt: {}",
            req.display()
        ));
    }

    let mut log = String::new();

    let mut pip_cmd = Command::new(&py);
    pip_cmd
        .args(["-m", "pip", "install", "-r"])
        .arg(&req);
    apply_no_window(&mut pip_cmd);
    let pip_out = pip_cmd
        .output()
        .map_err(|e| format!("执行 pip 失败: {e}"))?;
    log.push_str("=== pip install ===\n");
    log.push_str(&String::from_utf8_lossy(&pip_out.stdout));
    log.push_str(&String::from_utf8_lossy(&pip_out.stderr));
    if !pip_out.status.success() {
        return Err(format!(
            "pip 安装失败（退出码 {:?}）。日志:\n{}",
            pip_out.status.code(),
            log
        ));
    }

    let mut pw_cmd = Command::new(&py);
    pw_cmd.args(["-m", "playwright", "install", "chromium"]);
    apply_no_window(&mut pw_cmd);
    let pw_out = pw_cmd
        .output()
        .map_err(|e| format!("执行 playwright 失败: {e}"))?;
    log.push_str("\n=== playwright install chromium ===\n");
    log.push_str(&String::from_utf8_lossy(&pw_out.stdout));
    log.push_str(&String::from_utf8_lossy(&pw_out.stderr));
    if !pw_out.status.success() {
        return Err(format!(
            "playwright 安装失败（退出码 {:?}）。日志:\n{}",
            pw_out.status.code(),
            log
        ));
    }

    log.push_str("\n✅ 依赖安装完成，可点击「启动本地投递引擎」。");
    Ok(log)
}

#[tauri::command]
fn agent_start(
    app: tauri::AppHandle,
    state: State<'_, AgentState>,
    token: String,
    api_origin: String,
) -> Result<String, String> {
    let mut lock = state.0.lock().map_err(|e| e.to_string())?;
    if lock.is_some() {
        return Err("本地引擎已在运行中".into());
    }

    let script = resolve_agent_script(&app)?;
    let py = resolve_python_executable()?;

    let mut cmd = Command::new(&py);
    cmd.arg(script.as_os_str());
    cmd.arg("--token").arg(&token);
    cmd.arg("-a").arg(&api_origin);
    cmd.stdin(Stdio::null());
    apply_no_window(&mut cmd);

    let child = cmd.spawn().map_err(|e| {
        format!(
            "无法启动 Agent: {e}。请先点击「安装 Python 依赖」，或手动执行 pip / playwright install。"
        )
    })?;

    *lock = Some(child);
    Ok("started".into())
}

#[tauri::command]
fn agent_stop(state: State<'_, AgentState>) -> Result<String, String> {
    let mut lock = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(mut c) = lock.take() {
        let _ = c.kill();
        let _ = c.wait();
        return Ok("stopped".into());
    }
    Ok("idle".into())
}

#[tauri::command]
fn agent_status(state: State<'_, AgentState>) -> Result<bool, String> {
    let mut lock = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(ref mut c) = *lock {
        match c.try_wait() {
            Ok(Some(_)) => {
                *lock = None;
                return Ok(false);
            }
            Ok(None) => return Ok(true),
            Err(e) => {
                *lock = None;
                return Err(e.to_string());
            }
        }
    }
    Ok(false)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AgentState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            agent_start,
            agent_stop,
            agent_status,
            agent_diagnose,
            agent_install_deps
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn requirements_next_to_script() {
        let script = PathBuf::from("/opt/agent/boss_local_agent.py");
        let req = resolve_requirements_txt(&script);
        assert_eq!(
            req,
            PathBuf::from("/opt/agent/requirements.txt")
        );
    }
}
