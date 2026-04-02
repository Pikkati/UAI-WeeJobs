#!/usr/bin/env node
const jest = require('jest');
const config = require('./jest.config.cjs');

jest.run(['--config=jest.config.cjs', '--passWithNoTests']);
