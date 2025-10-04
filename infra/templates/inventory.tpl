[app_servers]
${app_server_ip}

[all:vars]
ansible_user = "${ssh_user}"
ansible_ssh_private_key_file = "${ssh_key_path}"
ansible_python_interpreter = /usr/bin/python3