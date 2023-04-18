import { existsSync, readFileSync, writeFileSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';

export class SnapmakerToken {
  readonly timestamp: number;
  constructor(readonly guid: string) {
    this.timestamp = Date.now();
  }

  toJSON() {
    return {
      guid: this.guid,
      timestamp: this.timestamp,
    };
  }
}

// TODO purge old tokens

export class SnapmakerTokenManager {
  readonly tokensPath: string;
  private readonly tokens: SnapmakerToken[] = [];
  constructor(tokensPath = './.cat_sm_tokens') {
    this.tokensPath = path.isAbsolute(tokensPath)
      ? tokensPath
      : path.join(process.cwd(), tokensPath);
    if (existsSync(this.tokensPath)) {
      const jsonTokens = readFileSync(this.tokensPath);
      this.tokens = JSON.parse(jsonTokens.toString().trim());
    } else {
      writeFileSync(this.tokensPath, '[]');
    }
  }

  async saveToken(guid: string) {
    const newToken = new SnapmakerToken(guid);
    this.tokens.push(newToken);
    await fs.writeFile(this.tokensPath, JSON.stringify(this.tokens || []));
    return newToken;
  }

  getSavedToken(): SnapmakerToken | null {
    return this.tokens.length === 0
      ? null
      : this.tokens.sort((a, b) => b.timestamp - a.timestamp)[0];
  }
}

export default new SnapmakerTokenManager();
