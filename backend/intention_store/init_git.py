import git
import os

repo_path = os.path.join(os.getcwd(), 'intention_store')
repo = git.Repo.init(repo_path)
print(f'Git repo initialized at: {repo.working_dir}')
