# Dotfiles Sync

Use AWS [EventBridge](https://aws.amazon.com/eventbridge/) and [Lambda](https://aws.amazon.com/lambda/) to backup my personal dotfiles from Dropbox to GitHub and S3.

## Local Development

1. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

2. Install [Terraform](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli).

3. Install [Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs).

4. Install dependencies with [pnpm](https://pnpm.io/):

    ```bash
    npm i -g pnpm
    pnpm i
    ```

5. Run scripts with `pnpm run <command>`:

    |Command|Description|
    |---|---|
    |`format`|Format and apply safe lint fixes with [Biome](https://biomejs.dev/).|
    |`lint`|Lint code without applying fixes.
    |`start`|Run the Lambda function locally.|
    |`dev`|Run the Lambda function locally in watch mode.|
    |`build`|Bundle the Lambda function source for distribution with [esbuild](https://esbuild.github.io/).|

6. Deploy to AWS with Terraform:

    ```bash
    terraform init
    terraform apply
    ```

## License

This project is licensed under the [MIT license](https://opensource.org/license/mit/).
