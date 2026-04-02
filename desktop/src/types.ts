/** 与 Rust agent_diagnose 返回结构一致 */
export interface AgentDiagnose {
  python_exe: string | null;
  python_version: string | null;
  script_path: string | null;
  requirements_path: string | null;
  script_ok: boolean;
  requirements_ok: boolean;
  summary: string;
}
