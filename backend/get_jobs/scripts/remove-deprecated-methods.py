#!/usr/bin/env python3
"""
删除Boss.java中所有标记为@Deprecated的方法
"""
import re
import sys

def remove_deprecated_methods(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    new_lines = []
    i = 0
    skip_until_brace = 0
    brace_count = 0
    in_deprecated_method = False

    while i < len(lines):
        line = lines[i]

        # 检查是否是@Deprecated标记
        if '@Deprecated' in line and 'private' in lines[i+1] if i+1 < len(lines) else False:
            # 找到方法开始
            in_deprecated_method = True
            brace_count = 0
            skip_until_brace = 0

            # 跳过注释和@Deprecated行
            j = i
            while j >= 0 and (lines[j].strip().startswith('*') or
                             lines[j].strip().startswith('/**') or
                             lines[j].strip().startswith('*/') or
                             '@Deprecated' in lines[j] or
                             lines[j].strip() == ''):
                j -= 1

            # 从注释开始删除
            start_delete = j + 1

            # 找到方法签名
            method_start = i + 1
            if '@SneakyThrows' in lines[method_start]:
                method_start += 1

            # 计算方法的结束位置
            brace_count = 0
            method_end = method_start
            found_first_brace = False

            for k in range(method_start, len(lines)):
                line_k = lines[k]
                brace_count += line_k.count('{')
                brace_count -= line_k.count('}')

                if '{' in line_k:
                    found_first_brace = True

                if found_first_brace and brace_count == 0:
                    method_end = k
                    break

            # 跳过整个方法（包括注释）
            i = method_end + 1
            continue

        new_lines.append(line)
        i += 1

    # 删除连续的注释块
    final_lines = []
    i = 0
    while i < len(new_lines):
        line = new_lines[i]

        # 跳过孤立的注释块
        if (line.strip().startswith('// ==========') and
            i + 1 < len(new_lines) and
            new_lines[i+1].strip().startswith('//')):
            # 跳过整个注释块
            while i < len(new_lines) and new_lines[i].strip().startswith('//'):
                i += 1
            continue

        final_lines.append(line)
        i += 1

    return '\n'.join(final_lines)

if __name__ == '__main__':
    file_path = sys.argv[1] if len(sys.argv) > 1 else 'src/main/java/boss/Boss.java'
    new_content = remove_deprecated_methods(file_path)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"已删除所有@Deprecated方法: {file_path}")



