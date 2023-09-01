<template>
  <div class="dark:bg-muted-900 bg-white py-12">
    <div class="mx-auto w-full max-w-7xl px-4">
      <div class="mb-12 max-w-2xl">
        <BaseText
          class="text-primary-500 mb-2 text-[0.65rem] uppercase tracking-wider"
          >Avantages</BaseText
        >
        <BaseHeading
          as="h2"
          size="4xl"
          weight="light"
          lead="tight"
          class="text-muted-800 mx-auto mb-4 dark:text-white"
        >
          Pourquoi contribuer ?
        </BaseHeading>
        <BaseParagraph
          size="lg"
          class="text-muted-500 dark:text-muted-100 mx-auto mb-4"
        >
          Quelques raisons aui devraient vous motiver à contribuer
        </BaseParagraph>
      </div>
      <div class="ltablet:grid-cols-3 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <LandingFeaturesTile
          title="Evolution de la communauté"
          icon="file-icons:eslint"
        >
          Gràce à vos contribution, des projet important peuvent voir le jour
        </LandingFeaturesTile>
        <LandingFeaturesTile title="Culture" icon="file-icons:eslint">
          Vos contributions nous permet de promouvoir notre culture
        </LandingFeaturesTile>
        <LandingFeaturesTile title="Transparence" icon="file-icons:eslint">
          Toutes les contributions sont affichés publiquement
        </LandingFeaturesTile>
        <LandingFeaturesTile title="Humanitaire" icon="file-icons:eslint">
          Vos contribuions permettent de venir en aide aux nécessiteux de la
          communauté
        </LandingFeaturesTile>
        <LandingFeaturesTile title="Notoriété" icon="file-icons:eslint">
          Contribuer régulièrement montre mon amour et attachement à votre
          communauté
        </LandingFeaturesTile>
        <LandingFeaturesTile title="Aide" icon="file-icons:eslint">
          Contribuer vous permet en retour de recevoir un soutient obligatoire
          en cas de nécessité
        </LandingFeaturesTile>
      </div>

      <div class="mt-16 flex items-center justify-center">
        <BaseButton to="/dashboards" shape="curved" color="primary">
         Je souhaite contribuer
        </BaseButton>
      </div>
    </div>
  </div>
</template>
