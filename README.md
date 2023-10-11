# onepubkey

`onepubkey` is a tool designed to merge any number of Solana pubkeys into one. Simply input any number of pubkeys using a csv file at [https://onepubkey.com](https://onepubkey.com), and they'll be merged into a single pubkey.

## Key Features

- **Simplicity**: No need to juggle multiple pubkeys. Just enter and merge.
- **Scalability**: Designed to handle any number of pubkeys.
- **Integration**: Currently deployed to mainnet.

## Details

- **Mainnet programId**: `onepb36eDUJnQAAUQCp6F3gS3PmGH1m3WX3CKTCsy6t`
- **Mem pool programId**: `mempnhZcS6Ugdf6A9rnzcmiBfnUHCnLzZsB1oL4U1nY`

## Cost-Efficiency

The system is designed to be extremely cost-effective. By using IPFS mapping, it requires only a small amount of bytes, making it an ideal solution for those who wish to minimize their footprint and associated costs.

## Purpose

The `onepubkey` is primarily intended as a payment reception tool. This means that users can consolidate numerous pubkeys into one main pubkey to receive payments. However, it's important to note that this consolidated pubkey is not designed to function as a signer or multi-auth wallet. It will not work in those capacities, ensuring that the integrity and security of your primary keys remain uncompromised.

## Usage

### onepubkey worker client

To run the worker client:

[Instructions for running worker client will be provided here]

## Contribute

Contributions to improve `onepubkey` are always welcome. Whether it's enhancing the merging algorithm, adding new features, or fixing bugs, your participation is greatly appreciated.

## License

[MIT License](LICENSE)

## Support

For any questions or feedback, please [open an issue](https://github.com/cyon-labs/onepubkey/issues) on GitHub.
