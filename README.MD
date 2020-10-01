[![Build Status](https://dev.azure.com/ChristophMurczek/storybook-builder/_apis/build/status/cmurczek.storybook-builder?branchName=master)](https://dev.azure.com/ChristophMurczek/storybook-builder/_build/latest?definitionId=1&branchName=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
![GitHub](https://img.shields.io/github/license/cmurczek/storybook-builder)

# Storybook Builder
runs storybook for your angular projects the angular way.

## Installation
To install **storybook-runner** just execute `ng add storybook-runner`.
The schematic will add the builder and requiered storybook configuration to your default project.
To install for a specific project use the _--project <projectName>_ switch.

## Configuration
The builder can be configured via the angular workspace configuration file.
It provides reasonable defaults.

## Usage
To use the builder just run `ng run <projectName>:storybook`, where _projectName_ is the name of the project for which you want to start the storybook dev-server.
