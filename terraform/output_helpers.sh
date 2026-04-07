#!/bin/sh
set -eu

require_terraform_outputs() {
    if ! command -v jq >/dev/null 2>&1; then
        echo "Error: jq is required to export Terraform outputs." >&2
        exit 1
    fi

    error_file=$(mktemp "${TMPDIR:-/tmp}/terraform-output-error.XXXXXX")

    if ! outputs_json=$(terraform output -json -no-color 2>"$error_file"); then
        if grep -q "Required plugins are not installed" "$error_file"; then
            echo "Error: Terraform is not initialized in ./terraform." >&2
            echo "Run 'cd terraform && terraform init' and then retry the export command." >&2
        else
            echo "Error: Failed to read Terraform outputs." >&2
            echo "Run 'cd terraform && terraform apply' before exporting auth env files." >&2
        fi

        rm -f "$error_file"
        exit 1
    fi

    rm -f "$error_file"

    if [ "$outputs_json" = "{}" ]; then
        echo "Error: Failed to read Terraform outputs." >&2
        echo "Run 'cd terraform && terraform apply' before exporting auth env files." >&2
        exit 1
    fi

    printf '%s' "$outputs_json"
}

terraform_output_value() {
    output_name=$1
    outputs_json=$2

    value=$(printf '%s' "$outputs_json" | jq -er --arg name "$output_name" '.[$name].value')

    if [ -z "$value" ]; then
        echo "Error: Terraform output '$output_name' is empty." >&2
        exit 1
    fi

    printf '%s' "$value"
}
