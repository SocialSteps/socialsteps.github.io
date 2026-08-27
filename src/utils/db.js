import localforage from 'localforage';

// Initialize the local offline database
localforage.config({
  name: 'SocialSteps',
  storeName: 'profiles'
});

export const getLocalProfiles = async () => {
  try {
    const profiles = await localforage.getItem('profiles');
    return profiles || {};
  } catch (e) {
    console.error("Error reading from localforage:", e);
    return {};
  }
};

export const saveLocalProfile = async (profile) => {
  try {
    const profiles = await getLocalProfiles();
    profiles[profile.passwordKey] = profile;
    await localforage.setItem('profiles', profiles);
  } catch (e) {
    console.error("Error saving to localforage:", e);
  }
};
