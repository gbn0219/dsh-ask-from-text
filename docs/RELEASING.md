# Releasing

This document is for maintainers. End-user documentation is in the repository
README.

## Versioning

- The package version is `package.json` `version`.
- The GitHub tag is `v<version>`.
- Keep the README badge, CHANGELOG latest heading and tag in sync.

## GitHub

The repository is expected to be `gbn0219/dsh-inline-followup`.

```sh
git add .
git commit -m "release: v0.1.9"
git tag -d v0.1.9 2>/dev/null || true
git tag v0.1.9
git push -u origin main
git push --tags
```

## npm

```sh
npm login
npm run check
npm pack --dry-run
npm publish --access public
```

After publishing, verify:

```sh
npm view dsh-inline-followup version dist.tarball
```

## DSH community index

1. Confirm the npm package is public and the version matches the GitHub tag.
2. Follow the official guide:
   <https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.zh.md>
3. Submit the plugin to <https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>
   or add the community index source in DSH's **Plugins → Discover → Index
   sources**.
4. Keep `dsh-plugin` and `deepseek-harness` topics on the GitHub repository.

## Local preflight

```sh
npm run check
node -e "for (const f of ['package.json','locale/en.json','locale/zh.json']) JSON.parse(require('fs').readFileSync(f,'utf8'))"
npm pack --dry-run
```
