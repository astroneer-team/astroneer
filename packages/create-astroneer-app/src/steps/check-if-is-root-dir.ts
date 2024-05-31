if (!useRootDir) {
  if (existsSync(projectDir)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory ${picocolors.blue(`\`${_projectName}\``)} already exists. Do you want to overwrite it?`,
      initial: false,
    });

    if (!overwrite) {
      console.error(
        picocolors.red(
          `Operation cancelled. Astroneer.js app was not created.`,
        ),
      );

      process.exit(1);
    }
  }