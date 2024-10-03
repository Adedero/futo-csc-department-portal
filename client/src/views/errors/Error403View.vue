<template>
  <main class="h-dvh w-dvw relative">
    <!-- <header c -->lass="p-3">
    <!--   <button --> @click="$router.push('/')" type="button">
    <!--     <img  -->src="../../assets/img/futo-logo.png" alt="futo-logo" />
    <!--   </butto -->n>
    <!-- </header> -->

    <div class="p-3 w-full mt-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]">
      <h1 class="text-4xl font-medium">403</h1>
     <!--  <div class="max-w-[28rem] mx-auto">
        <img src="../../assets/images/403.svg" alt="Page not found" class="block" />
      </div> -->

      <div class="text-center grid gap-2 place-content-center">
        <p class="text-xl md:text-2xl">Oops! You aren't allowed to view this page.</p>
        <p class="font-medium">This could have happened for a number of reasons:</p>
        <ul class="list-disc text-left">
          <li>If you're trying to visit a user's profile, they may have blocked you 😔.</li>
          <li>
            Your log in session may have expired. Try
            <RouterLink :to="{ name: 'login' }" class="text-[blue] hover:underline">signing in</RouterLink>
            again.
          </li>
          <li>You may have encountered a network issue.</li>
        </ul>

        <div class="w-fit mx-auto mt-5 flex gap-2">
          <Button @click="$router.push('/')" label="Explore More Content" rounded />
          <Button @click="$router.back()" label="Take Me Back" rounded severity="secondary" />
        </div>
      </div>
    </div>
  </main>
</template>
